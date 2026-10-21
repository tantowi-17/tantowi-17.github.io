/*
 * Portfolio chat assistant — UI.
 * Loaded on demand by site.js the first time the chat button is used.
 * Reads facts from the page itself, so answers stay in sync with the site;
 * nothing typed here leaves the browser.
 */
(function () {
	'use strict';

	var KB_URL = 'data/assistant.json';
	var ARTICLES_URL = 'data/articles.json';
	var STORE_KEY = 'chat:v1';
	var MAX_LEN = 300;

	var fab = document.getElementById('chat-fab');
	var root = document.documentElement;
	var mobileQuery = window.matchMedia('(max-width: 640px)');
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

	var engine = null;
	var ready = null;
	var state = {};
	var transcript = []; // [{from, text, actions, quick}] — persisted per tab
	var busy = false;
	var isOpen = false;
	var panel, log, quickBar, form, input, sendBtn;

	/* Page data ---------------------------------------------------------- */

	var refCount = 0;
	function ensureId(el) {
		if (!el.id) el.id = 'chat-ref-' + (++refCount);
		return el.id;
	}

	function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
	function all(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }

	function timeline(heading) {
		var h = all('.exp-heading').filter(function (x) { return txt(x) === heading; })[0];
		var list = h && h.nextElementSibling;
		if (!list) return [];
		return all(':scope > li', list).map(function (li) {
			var h4 = li.querySelector('h4');
			var place = h4 && h4.querySelector('.tl-place');
			return {
				date: txt(li.querySelector('.tl-date')),
				org: h4 ? txt(h4).replace(txt(place), '').trim() : '',
				title: txt(h4),
				place: txt(li.querySelector('p.tl-place')) || txt(place),
				roles: all('.roles li', li).map(function (r) {
					return { title: txt(r.querySelector('span')), date: txt(r.querySelector('.mono')) };
				}),
				ref: ensureId(li)
			};
		});
	}

	function readPage(articles) {
		var cases = all('#work-list .case').map(function (el) {
			return {
				kind: 'enterprise',
				title: txt(el.querySelector('h3')),
				role: txt(el.querySelector('.case-role')),
				meta: all('.case-meta span', el).map(txt).join(' · '),
				desc: txt(el.querySelector('header + p')),
				tags: all('.tags li', el).map(txt),
				ref: ensureId(el)
			};
		});
		var projects = all('#project-list .project').map(function (el) {
			return {
				kind: 'project',
				category: el.getAttribute('data-category'),
				title: txt(el.querySelector('h3')),
				meta: txt(el.querySelector('.project-type')),
				desc: txt(el.querySelector('.project-body p:last-child')),
				image: !!el.querySelector('[data-full]'),
				tags: [],
				ref: ensureId(el)
			};
		});
		var skillGroups = all('.skill-group').map(function (el) {
			return { name: txt(el.querySelector('h3')), skills: all('.tags li', el).map(txt), ref: ensureId(el) };
		});
		var experience = timeline('Work');
		var docs = []
			.concat(all('#about .about-body p').map(function (p) { return { title: 'About', text: txt(p), ref: 'about' }; }))
			.concat(cases.concat(projects).map(function (p) { return { title: p.title, text: p.desc + ' ' + (p.tags || []).join(' '), ref: p.ref }; }))
			.concat(experience.map(function (x) { return { title: x.title, text: txt(document.getElementById(x.ref)), ref: x.ref }; }))
			.concat(skillGroups.map(function (g) { return { title: g.name, text: g.skills.join(', '), ref: g.ref }; }));

		return {
			skillGroups: skillGroups,
			projects: cases.concat(projects),
			experience: experience,
			education: timeline('Education'),
			recognition: timeline('Recognition'),
			certificates: all('.cert').map(function (el) {
				return { title: txt(el.querySelector('h3')), issuer: txt(el.querySelector('.cert-body p')) };
			}),
			articles: articles || [],
			docs: docs
		};
	}

	function getJson(url) {
		return fetch(url, { cache: 'no-cache' }).then(function (res) {
			if (!res.ok) throw new Error(url + ' ' + res.status);
			return res.json();
		});
	}

	function load() {
		if (!ready) {
			ready = Promise.all([
				getJson(KB_URL),
				getJson(ARTICLES_URL).then(function (d) { return d.items || []; }, function () { return []; })
			]).then(function (res) {
				engine = window.ChatEngine.create({ kb: res[0], page: readPage(res[1]) });
			});
		}
		return ready;
	}

	/* Persistence -------------------------------------------------------- */

	function save() {
		try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ transcript: transcript.slice(-40), state: state })); } catch (e) {}
	}
	function restore() {
		try {
			var data = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
			if (data && Array.isArray(data.transcript)) { transcript = data.transcript; state = data.state || {}; return true; }
		} catch (e) {}
		return false;
	}

	/* DOM ----------------------------------------------------------------- */

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	function icon(id) {
		var ns = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(ns, 'svg');
		svg.setAttribute('class', 'icon');
		svg.setAttribute('aria-hidden', 'true');
		var use = document.createElementNS(ns, 'use');
		use.setAttribute('href', '#' + id);
		svg.appendChild(use);
		return svg;
	}

	function build() {
		panel = el('section', 'chat-panel');
		panel.id = 'chat-panel';
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-labelledby', 'chat-title');
		panel.hidden = true;

		var head = el('header', 'chat-head');
		var avatar = el('span', 'chat-avatar');
		avatar.setAttribute('aria-hidden', 'true');
		avatar.appendChild(icon('i-chat'));
		var titles = el('div', 'chat-titles');
		var title = el('h2', '', 'Ask about Tanto');
		title.id = 'chat-title';
		titles.appendChild(title);
		titles.appendChild(el('p', '', 'Automated assistant · answers from this site'));
		var resetBtn = el('button', 'chat-icon-btn');
		resetBtn.type = 'button';
		resetBtn.setAttribute('aria-label', 'Start over');
		resetBtn.title = 'Start over';
		resetBtn.appendChild(icon('i-refresh'));
		resetBtn.addEventListener('click', reset);
		var closeBtn = el('button', 'chat-icon-btn');
		closeBtn.type = 'button';
		closeBtn.setAttribute('aria-label', 'Close chat');
		closeBtn.appendChild(icon('i-close'));
		closeBtn.addEventListener('click', function () { close(true); });
		head.appendChild(avatar);
		head.appendChild(titles);
		head.appendChild(resetBtn);
		head.appendChild(closeBtn);

		log = el('div', 'chat-log');
		log.setAttribute('role', 'log');
		log.setAttribute('aria-live', 'polite');

		quickBar = el('div', 'chat-quick');
		quickBar.setAttribute('aria-label', 'Suggested questions');

		form = el('form', 'chat-form');
		var labelEl = el('label', 'visually-hidden', 'Your question');
		labelEl.setAttribute('for', 'chat-input');
		input = el('input');
		input.id = 'chat-input';
		input.type = 'text';
		input.maxLength = MAX_LEN;
		input.autocomplete = 'off';
		input.setAttribute('enterkeyhint', 'send');
		input.placeholder = 'Ask in English or Bahasa Indonesia…';
		sendBtn = el('button', 'chat-send');
		sendBtn.type = 'submit';
		sendBtn.setAttribute('aria-label', 'Send');
		sendBtn.appendChild(icon('i-send'));
		form.appendChild(labelEl);
		form.appendChild(input);
		form.appendChild(sendBtn);
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var value = input.value.trim();
			if (!value || busy) return;
			input.value = '';
			send(value);
		});

		panel.appendChild(head);
		panel.appendChild(log);
		panel.appendChild(quickBar);
		panel.appendChild(form);
		panel.addEventListener('keydown', onKeydown);
		document.body.appendChild(panel);
	}

	function renderMessage(msg, animate) {
		var row = el('div', 'chat-msg ' + (msg.from === 'user' ? 'is-user' : 'is-bot'));
		if (!animate) row.classList.add('no-anim');
		row.appendChild(el('p', 'chat-bubble', msg.text));
		if (msg.actions && msg.actions.length) {
			var wrap = el('div', 'chat-actions');
			msg.actions.forEach(function (a) { var node = renderAction(a); if (node) wrap.appendChild(node); });
			row.appendChild(wrap);
		}
		log.appendChild(row);
		log.scrollTop = log.scrollHeight;
	}

	function safeHref(href) {
		return /^(https:\/\/|mailto:)/i.test(href || '') ? href : '';
	}

	function renderAction(a) {
		var node;
		if (a.type === 'email' || a.type === 'link') {
			var href = safeHref(a.href);
			if (!href) return null;
			node = el('a', 'chat-action' + (a.primary ? ' is-primary' : ''), a.label);
			node.href = href;
			if (a.type === 'link') { node.target = '_blank'; node.rel = 'noopener'; }
			return node;
		}
		node = el('button', 'chat-action', a.label);
		node.type = 'button';
		node.addEventListener('click', function () { runAction(a, node); });
		return node;
	}

	function renderQuick(list) {
		quickBar.textContent = '';
		(list || []).forEach(function (q) {
			var chip = el('button', 'chat-chip', q.label);
			chip.type = 'button';
			chip.addEventListener('click', function () {
				if (busy) return;
				send(q.label, { intent: q.intent, value: q.value });
			});
			quickBar.appendChild(chip);
		});
		quickBar.hidden = !quickBar.children.length;
	}

	function showTyping() {
		var row = el('div', 'chat-msg is-bot chat-typing');
		row.setAttribute('aria-label', 'Assistant is typing');
		var b = el('p', 'chat-bubble');
		b.appendChild(el('span'));
		b.appendChild(el('span'));
		b.appendChild(el('span'));
		row.appendChild(b);
		log.appendChild(row);
		log.scrollTop = log.scrollHeight;
		return row;
	}

	/* Conversation -------------------------------------------------------- */

	function push(msg, animate) {
		transcript.push(msg);
		renderMessage(msg, animate);
		save();
	}

	function send(text, opts) {
		opts = opts || {};
		if (opts.value === '__cancel') text = text || 'Cancel';
		push({ from: 'user', text: text.slice(0, MAX_LEN) }, true);
		renderQuick([]);
		busy = true;
		sendBtn.disabled = true;

		var reply;
		try {
			reply = engine.reply(text, { state: state, intent: opts.intent, value: opts.value });
		} catch (err) {
			reply = { text: 'Sorry, something went wrong. You can email Tanto at tantowibowo7@gmail.com.', actions: [], quick: [] };
			if (window.console) console.error(err);
		}

		var typing = showTyping();
		var delay = reduceMotion.matches ? 0 : Math.min(350 + reply.text.length * 3, 900);
		setTimeout(function () {
			typing.remove();
			if (reply.state) state = reply.state;
			push({ from: 'bot', text: reply.text, actions: reply.actions || [], quick: reply.quick || [] }, true);
			renderQuick(reply.quick);
			busy = false;
			sendBtn.disabled = false;
			if (finePointer.matches) input.focus();
		}, delay);
	}

	function greet() {
		var lang = /^id\b/i.test(navigator.language || '') ? 'id' : 'en';
		var w = engine.welcome(lang);
		state = { lang: lang };
		push({ from: 'bot', text: w.text, actions: [], quick: w.quick }, false);
		renderQuick(w.quick);
	}

	function reset() {
		transcript = [];
		state = {};
		log.textContent = '';
		try { sessionStorage.removeItem(STORE_KEY); } catch (e) {}
		greet();
		if (finePointer.matches) input.focus();
	}

	/* Actions -------------------------------------------------------------- */

	function goTo(target) {
		if (!target) return;
		// Reveal a project hidden by the Projects filter
		if (target.closest('[hidden]')) {
			var all = document.querySelector('.filters .chip[data-filter="all"]');
			if (all) all.click();
		}
		if (mobileQuery.matches) close(false);
		target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center', inline: 'center' });
		target.classList.remove('chat-highlight');
		void target.offsetWidth;
		target.classList.add('chat-highlight');
		setTimeout(function () { target.classList.remove('chat-highlight'); }, 2400);
	}

	function runAction(a, node) {
		if (a.type === 'section') {
			goTo(document.getElementById(a.target));
		} else if (a.type === 'ref') {
			goTo(document.getElementById(a.ref));
		} else if (a.type === 'image') {
			var card = document.getElementById(a.ref);
			var trigger = card && card.querySelector('[data-full]');
			if (trigger) { if (mobileQuery.matches) close(false); trigger.click(); }
		} else if (a.type === 'copy') {
			var done = function () {
				var old = node.textContent;
				node.textContent = state.lang === 'id' ? 'Tersalin!' : 'Copied!';
				setTimeout(function () { node.textContent = old; }, 1800);
			};
			if (navigator.clipboard) navigator.clipboard.writeText(a.value).then(done, function () { window.location.href = 'mailto:' + a.value; });
			else window.location.href = 'mailto:' + a.value;
		} else if (a.type === 'intent') {
			if (!busy) send(a.label, { intent: a.intent });
		}
	}

	/* Open / close -------------------------------------------------------- */

	function onKeydown(e) {
		if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
		// Keep focus inside the full-screen sheet on phones
		if (e.key === 'Tab' && mobileQuery.matches) {
			var items = all('button:not([disabled]), a[href], input', panel).filter(function (x) { return x.offsetParent !== null; });
			if (!items.length) return;
			var first = items[0], last = items[items.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		}
	}

	function open() {
		return load().then(function () {
			if (!panel) {
				build();
				if (restore() && transcript.length) {
					transcript.forEach(function (m) { renderMessage(m, false); });
					var last = transcript[transcript.length - 1];
					renderQuick(last && last.from === 'bot' ? last.quick : []);
				} else {
					greet();
				}
			}
			isOpen = true;
			panel.hidden = false;
			panel.setAttribute('aria-modal', mobileQuery.matches ? 'true' : 'false');
			requestAnimationFrame(function () { panel.classList.add('is-open'); });
			root.classList.add('chat-open');
			fab.setAttribute('aria-expanded', 'true');
			fab.setAttribute('aria-label', 'Close chat assistant');
			fab.classList.add('is-seen');
			try { sessionStorage.setItem('chat:seen', '1'); } catch (e) {}
			log.scrollTop = log.scrollHeight;
			if (finePointer.matches) input.focus();
		});
	}

	function close(returnFocus) {
		if (!panel || !isOpen) return;
		isOpen = false;
		panel.classList.remove('is-open');
		root.classList.remove('chat-open');
		fab.setAttribute('aria-expanded', 'false');
		fab.setAttribute('aria-label', 'Open chat assistant');
		setTimeout(function () { if (!isOpen) panel.hidden = true; }, reduceMotion.matches ? 0 : 200);
		if (returnFocus) fab.focus();
	}

	function toggle() { return isOpen ? (close(true), Promise.resolve()) : open(); }

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && isOpen) close(true);
	});

	window.PortfolioChat = { open: open, close: close, toggle: toggle, preload: load };
})();
