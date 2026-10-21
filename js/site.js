(function () {
	'use strict';

	var root = document.documentElement;

	/* Theme toggle ------------------------------------------------------- */
	var themeToggle = document.getElementById('theme-toggle');
	var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

	function currentTheme() {
		return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
	}

	function syncThemeColor() {
		var meta = document.querySelectorAll('meta[name="theme-color"]');
		var color = currentTheme() === 'dark' ? '#0E0F12' : '#FAFAF7';
		meta.forEach(function (m) { m.setAttribute('content', color); });
		themeToggle.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
	}

	themeToggle.addEventListener('click', function () {
		var next = currentTheme() === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		try { localStorage.setItem('theme', next); } catch (e) {}
		syncThemeColor();
	});
	syncThemeColor();

	/* Header: scrolled state + mobile menu ------------------------------- */
	var header = document.querySelector('.site-header');
	var nav = document.getElementById('site-nav');
	var navToggle = document.querySelector('.nav-toggle');

	var toTop = document.getElementById('to-top');

	function onScroll() {
		var y = window.scrollY;
		header.classList.toggle('is-scrolled', y > 8);
		if (toTop) {
			var max = document.documentElement.scrollHeight - window.innerHeight;
			toTop.classList.toggle('is-visible', y > window.innerHeight * 0.6);
			toTop.style.setProperty('--progress', max > 0 ? Math.min(y / max, 1).toFixed(3) : 0);
		}
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// Scroll to top in JS rather than relying on the #top anchor, which some
	// mobile browsers ignore (or skip when the hash is already #top)
	document.querySelectorAll('a[href="#top"]').forEach(function (link) {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
			if (location.hash) history.replaceState(null, '', location.pathname + location.search);
			// Return keyboard focus to the top of the page without a second jump
			var brand = document.querySelector('.brand');
			if (brand && link !== brand) brand.focus({ preventScroll: true });
		});
	});

	function setMenu(open) {
		nav.classList.toggle('is-open', open);
		navToggle.setAttribute('aria-expanded', String(open));
		navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
	}
	navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
	nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
	});

	/* Active nav link ---------------------------------------------------- */
	var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
	if ('IntersectionObserver' in window) {
		var sectionObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				navLinks.forEach(function (link) {
					link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
				});
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		navLinks.forEach(function (link) {
			var section = document.querySelector(link.getAttribute('href'));
			if (section) sectionObserver.observe(section);
		});
		// Sections without a nav link (hero, about, contact) clear the highlight
		document.querySelectorAll('main > section:not([id]), #about, #contact').forEach(function (section) {
			sectionObserver.observe(section);
		});
	}

	/* Hero photo tilt ---------------------------------------------------- */
	// Tilts the photo toward the cursor; layers at different translateZ give depth.
	var heroPhoto = document.querySelector('.hero-photo');
	var canTilt = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
	if (heroPhoto) {
		var heroArea = heroPhoto.closest('.hero') || heroPhoto;
		var tiltFrame = 0;
		var MAX_TILT = 7;

		heroArea.addEventListener('pointermove', function (e) {
			if (!canTilt.matches) return;
			cancelAnimationFrame(tiltFrame);
			tiltFrame = requestAnimationFrame(function () {
				var rect = heroPhoto.getBoundingClientRect();
				// -1..1 from the photo centre, clamped so far-away pointers don't over-rotate
				var x = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / rect.width));
				var y = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / rect.height));
				heroPhoto.classList.add('is-tilting');
				heroPhoto.style.setProperty('--ry', (x * MAX_TILT).toFixed(2) + 'deg');
				heroPhoto.style.setProperty('--rx', (-y * MAX_TILT).toFixed(2) + 'deg');
			});
		});
		heroArea.addEventListener('pointerleave', function () {
			cancelAnimationFrame(tiltFrame);
			heroPhoto.classList.remove('is-tilting');
			heroPhoto.style.setProperty('--rx', '0deg');
			heroPhoto.style.setProperty('--ry', '0deg');
		});
	}

	/* Reveal on scroll --------------------------------------------------- */
	var revealItems = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
		var revealObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					revealObserver.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		revealItems.forEach(function (el) { revealObserver.observe(el); });
	} else {
		revealItems.forEach(function (el) { el.classList.add('is-visible'); });
	}

	/* Project filters ---------------------------------------------------- */
	var chips = document.querySelectorAll('.filters .chip');
	var projects = document.querySelectorAll('.project');
	chips.forEach(function (chip) {
		chip.addEventListener('click', function () {
			var filter = chip.getAttribute('data-filter');
			chips.forEach(function (c) {
				var active = c === chip;
				c.classList.toggle('is-active', active);
				c.setAttribute('aria-pressed', String(active));
			});
			projects.forEach(function (p) {
				p.hidden = filter !== 'all' && p.getAttribute('data-category') !== filter;
			});
			var list = document.getElementById('project-list');
			if (list) list.dispatchEvent(new CustomEvent('itemschange'));
		});
	});

	/* Collapsible card rows ---------------------------------------------- */
	// Grids marked [data-collapsible] start as a horizontal scroll row showing
	// three cards, with arrows and a "View all" toggle that expands to the full grid.
	// Without JS they simply render as the full grid.
	var COLLAPSED_COUNT = 3;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function icon(id) {
		return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
	}

	function initCollapsible(grid) {
		if (grid.hasAttribute('data-collapsible-ready') || grid.children.length <= COLLAPSED_COUNT) return;
		grid.setAttribute('data-collapsible-ready', '');

		var expanded = false;
		var section = grid.closest('section');
		var controls = document.createElement('div');
		controls.className = 'collapse-controls';
		controls.innerHTML =
			'<div class="scroll-nav">' +
				'<button type="button" class="icon-btn" data-dir="-1" aria-label="Scroll left" aria-controls="' + grid.id + '">' + icon('i-left') + '</button>' +
				'<button type="button" class="icon-btn" data-dir="1" aria-label="Scroll right" aria-controls="' + grid.id + '">' + icon('i-right') + '</button>' +
			'</div>' +
			'<button type="button" class="btn btn-ghost btn-sm view-all" aria-expanded="false" aria-controls="' + grid.id + '">' +
				'<span class="view-all-label"></span>' + icon('i-down') +
			'</button>';
		grid.insertAdjacentElement('afterend', controls);

		var prevBtn = controls.querySelector('[data-dir="-1"]');
		var nextBtn = controls.querySelector('[data-dir="1"]');
		var toggle = controls.querySelector('.view-all');
		var label = controls.querySelector('.view-all-label');

		function visibleItems() {
			return Array.prototype.filter.call(grid.children, function (c) { return !c.hidden; });
		}

		function update() {
			var count = visibleItems().length;
			var needsToggle = count > COLLAPSED_COUNT;
			label.textContent = expanded ? 'Show less' : 'View all ' + count;
			toggle.hidden = !needsToggle && !expanded;
			var overflow = !expanded && grid.scrollWidth > grid.clientWidth + 2;
			controls.querySelector('.scroll-nav').hidden = !overflow;
			prevBtn.disabled = grid.scrollLeft <= 2;
			nextBtn.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
		}

		function setExpanded(value) {
			expanded = value;
			grid.classList.toggle('is-collapsed', !expanded);
			toggle.setAttribute('aria-expanded', String(expanded));
			toggle.classList.toggle('is-expanded', expanded);
			grid.scrollLeft = 0;
			// Reveal everything at once when expanding, so off-screen cards aren't left invisible
			if (expanded) grid.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
			if (!expanded && section && section.getBoundingClientRect().top < 0) {
				section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
			}
			update();
		}

		function scrollByCard(dir) {
			var first = visibleItems()[0];
			var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
			var step = first ? first.getBoundingClientRect().width + gap : grid.clientWidth;
			grid.scrollBy({ left: dir * step, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
		}

		prevBtn.addEventListener('click', function () { scrollByCard(-1); });
		nextBtn.addEventListener('click', function () { scrollByCard(1); });
		toggle.addEventListener('click', function () { setExpanded(!expanded); });
		grid.addEventListener('scroll', update, { passive: true });
		grid.addEventListener('itemschange', function () { grid.scrollLeft = 0; update(); });
		window.addEventListener('resize', update);

		setExpanded(false);
	}

	// Static grids now; the Writing grid is initialised after its articles load
	document.querySelectorAll('[data-collapsible]').forEach(initCollapsible);

	/* Lightbox ----------------------------------------------------------- */
	var lightbox = document.getElementById('lightbox');
	var lbImg = document.getElementById('lightbox-img');
	var lbCaption = document.getElementById('lightbox-caption');
	var lbItems = [];
	var lbIndex = 0;
	var lbOpener = null;

	function captionFor(trigger) {
		var item = trigger.closest('li');
		var title = item && item.querySelector('h3');
		return title ? title.textContent.trim() : '';
	}

	function showLightbox(index) {
		lbIndex = (index + lbItems.length) % lbItems.length;
		var trigger = lbItems[lbIndex];
		lbImg.src = trigger.getAttribute('data-full');
		lbImg.alt = trigger.querySelector('img').alt;
		lbCaption.textContent = captionFor(trigger) + '  ·  ' + (lbIndex + 1) + ' / ' + lbItems.length;
	}

	document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
		gallery.addEventListener('click', function (e) {
			var trigger = e.target.closest('[data-full]');
			if (!trigger) return;
			// Only navigate through items that are currently visible (respects filters)
			lbItems = Array.prototype.filter.call(gallery.querySelectorAll('[data-full]'), function (el) {
				return !el.closest('[hidden]');
			});
			lbOpener = trigger;
			showLightbox(lbItems.indexOf(trigger));
			if (typeof lightbox.showModal === 'function') lightbox.showModal();
			else window.open(trigger.getAttribute('data-full'), '_blank');
		});
	});

	lightbox.addEventListener('click', function (e) {
		var action = e.target.closest('[data-lb]');
		if (action) {
			var type = action.getAttribute('data-lb');
			if (type === 'close') lightbox.close();
			else showLightbox(lbIndex + (type === 'next' ? 1 : -1));
		} else if (e.target === lightbox || e.target.tagName === 'FIGURE') {
			lightbox.close();
		}
	});
	lightbox.addEventListener('keydown', function (e) {
		if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
		if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
	});
	lightbox.addEventListener('close', function () {
		lbImg.removeAttribute('src');
		if (lbOpener) lbOpener.focus();
	});

	/* Copy email --------------------------------------------------------- */
	var copyBtn = document.getElementById('copy-email');
	if (copyBtn) {
		copyBtn.addEventListener('click', function () {
			var label = copyBtn.querySelector('span');
			var email = copyBtn.getAttribute('data-email');
			if (!navigator.clipboard) { window.location.href = 'mailto:' + email; return; }
			navigator.clipboard.writeText(email).then(function () {
				label.textContent = 'Copied!';
				setTimeout(function () { label.textContent = 'Copy email'; }, 2000);
			}, function () { window.location.href = 'mailto:' + email; });
		});
	}

	/* Medium articles ---------------------------------------------------- */
	// Primary source: data/articles.json, refreshed daily by the "Sync Medium
	// articles" GitHub Action (Medium's feed has no CORS). rss2json is a live fallback.
	var articleList = document.getElementById('article-list');
	var MEDIUM_PROFILE = 'https://medium.com/@tantowi17';
	var LOCAL_FEED = 'data/articles.json';
	var LIVE_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://medium.com/feed/@tantowi17');
	var MAX_ARTICLES = 9;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	}

	// Only allow https links/images, so feed data can't inject javascript: URLs
	function safeUrl(url) {
		try {
			var parsed = new URL(url);
			return parsed.protocol === 'https:' ? parsed.href : '';
		} catch (e) { return ''; }
	}

	function getJson(url) {
		return fetch(url, { cache: 'no-cache' }).then(function (res) {
			if (!res.ok) throw new Error(url + ' ' + res.status);
			return res.json();
		});
	}

	function fromLocal(data) {
		if (!data || !Array.isArray(data.items) || !data.items.length) throw new Error('Empty local feed');
		return data.items;
	}

	// Normalise rss2json items to the same shape as data/articles.json
	function fromLive(data) {
		if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('Bad live feed');
		return data.items.map(function (item) {
			// Parse in an inert document so nothing in the feed can execute
			var doc = new DOMParser().parseFromString(item.content || item.description || '', 'text/html');
			var img = doc.querySelector('img');
			var text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
			return {
				title: item.title,
				link: item.link,
				date: (item.pubDate || '').slice(0, 10),
				thumbnail: item.thumbnail || (img ? img.getAttribute('src') : ''),
				excerpt: text.length > 160 ? text.slice(0, 160).replace(/\s+\S*$/, '') + '…' : text,
				tags: (item.categories || []).slice(0, 3)
			};
		});
	}

	function formatDate(iso) {
		var date = new Date(iso + 'T00:00:00');
		return isNaN(date) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function renderArticles(items) {
		articleList.textContent = '';
		items.slice(0, MAX_ARTICLES).forEach(function (item) {
			var link = safeUrl(item.link);
			if (!link) return;

			var card = el('a', 'article');
			card.href = link;
			card.target = '_blank';
			card.rel = 'noopener';

			var thumbWrap = el('div', 'article-thumb');
			var thumb = safeUrl(item.thumbnail);
			if (thumb) {
				var img = el('img');
				img.src = thumb;
				img.alt = '';
				img.loading = 'lazy';
				img.decoding = 'async';
				thumbWrap.appendChild(img);
			}
			card.appendChild(thumbWrap);

			var body = el('div', 'article-body');
			var date = formatDate(item.date);
			if (date) {
				var time = el('time', 'article-date', date);
				time.dateTime = item.date;
				body.appendChild(time);
			}
			body.appendChild(el('h3', '', item.title || 'Untitled'));
			if (item.excerpt) body.appendChild(el('p', 'article-excerpt', item.excerpt));

			var footer = el('div', 'article-footer');
			if (item.tags && item.tags.length) {
				var tags = el('ul', 'tags');
				item.tags.slice(0, 2).forEach(function (t) { tags.appendChild(el('li', '', t.replace(/-/g, ' '))); });
				footer.appendChild(tags);
			}
			var cta = el('span', 'article-cta', 'Read on Medium');
			cta.insertAdjacentHTML('beforeend', ' <svg class="icon" aria-hidden="true"><use href="#i-external"/></svg>');
			footer.appendChild(cta);
			body.appendChild(footer);

			card.appendChild(body);
			articleList.appendChild(card);
		});
		if (!articleList.children.length) renderFallback();
		else initCollapsible(articleList);
	}

	function renderFallback() {
		articleList.textContent = '';
		var box = el('div', 'article-empty');
		box.appendChild(document.createTextNode('Articles couldn’t be loaded right now. '));
		var a = el('a', 'link-arrow', 'Read them on Medium');
		a.href = MEDIUM_PROFILE;
		a.target = '_blank';
		a.rel = 'noopener';
		box.appendChild(a);
		articleList.appendChild(box);
	}

	if (articleList && window.fetch) {
		getJson(LOCAL_FEED).then(fromLocal)
			.catch(function () { return getJson(LIVE_FEED).then(fromLive); })
			.then(renderArticles)
			.catch(renderFallback);
	}

	/* Chat assistant (loaded on demand) ------------------------------------ */
	var chatFab = document.getElementById('chat-fab');
	if (chatFab) {
		var chatLoading = null;
		var loadScript = function (src) {
			return new Promise(function (resolve, reject) {
				var s = document.createElement('script');
				s.src = src;
				s.onload = resolve;
				s.onerror = reject;
				document.body.appendChild(s);
			});
		};
		var loadChat = function () {
			if (window.PortfolioChat) return Promise.resolve();
			if (!chatLoading) {
				chatLoading = loadScript('js/chat-engine.js').then(function () { return loadScript('js/chat.js'); });
				chatLoading.catch(function () { chatLoading = null; });
			}
			return chatLoading;
		};
		try { if (sessionStorage.getItem('chat:seen')) chatFab.classList.add('is-seen'); } catch (e) {}
		// Start fetching as soon as the visitor shows intent
		chatFab.addEventListener('pointerenter', function () { loadChat().catch(function () {}); }, { once: true });
		chatFab.addEventListener('focus', function () { loadChat().catch(function () {}); }, { once: true });
		chatFab.addEventListener('click', function () {
			loadChat()
				.then(function () { return window.PortfolioChat.toggle(); })
				.catch(function () { window.location.href = 'mailto:tantowibowo7@gmail.com'; });
		});
	}

	/* Footer year -------------------------------------------------------- */
	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();
})();
