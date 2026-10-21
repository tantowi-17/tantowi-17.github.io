/*
 * Portfolio chat assistant — matching engine.
 *
 * Runs entirely in the browser (or Node, for tests). No network, no AI model:
 * questions are normalised, matched to intents with TF-IDF weighted overlap,
 * enriched with entities read from the page (skills, projects, services), and
 * answered from data/assistant.json plus the page's own content.
 *
 * Pipeline per message:
 *   normalise → language → entities → score intents → decide → compose reply
 */
(function (root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory();
	else root.ChatEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	/* Word lists -------------------------------------------------------- */

	function wordSet(str) {
		var set = Object.create(null);
		str.split(/\s+/).forEach(function (w) { if (w) set[w] = true; });
		return set;
	}

	// Function words that carry no topic (English + Indonesian). Question words
	// are included: they appear in almost every question and only add noise.
	var STOPWORDS = wordSet(
		'a an the is are am was were be been being do does did doing done' +
		' i me my mine you your yours yourself he him his she her it its we us our they them their' +
		' this that these those to of in on at by for with from into onto and or but if so than then too very' +
		' just also really please pls can could would will shall should may might must there here' +
		' have has had having any some get got let lets want wanna need needs like about tell show see give' +
		' what which who whom how why when many much more most other else all own one ok okay sure yes no not' +
		' yang dan di ke dari untuk dengan ini itu ada adalah apa apakah saya aku kamu anda dia beliau kami kita mereka' +
		' pun juga sih dong deh kok ya iya nih tuh lah kah mau ingin tolong bisa boleh siapa bagaimana gimana' +
		' kenapa mengapa tentang soal lihat liat kasih info informasi minta coba kak mas mbak bang pak bu gan min om'
	);
	// "done" is a timeline signal, so keep it out of the stop list
	delete STOPWORDS.done;

	// The owner's name appears in many questions ("how much does Tanto charge")
	// and must not pull everything toward the "about" intent.
	var NAME_WORDS = wordSet('tanto wibowo tantowi');
	var ABOUT_HINTS = wordSet('about tentang yourself himself');

	var LANG_ID = wordSet(
		'yang apa apakah bisa saya aku kamu anda berapa bagaimana gimana dan di ke dari untuk dengan ini itu ada mau ingin' +
		' tidak nggak gak enggak sudah belum lama tentang siapa dimana kapan kenapa tolong terima kasih makasih halo hai' +
		' harga biaya jasa buat bikin layanan kerja punya dong sih kak mas pak bu nya selamat pagi siang sore malam butuh'
	);
	var LANG_EN = wordSet(
		'the is are do does you your what how can much who where when about with for have has price cost service' +
		' hello hi hey thanks thank i me my want need would could please tell show any website build hire work'
	);

	// Normalise a few names before punctuation is stripped
	var PRE_REPLACE = [
		[/c\+\+/g, ' cpp '], [/c#/g, ' csharp '], [/\.net\b/g, ' dotnet '],
		[/next\.js/g, 'nextjs'], [/node\.js/g, 'nodejs'], [/vue\.js/g, 'vuejs'], [/ui\/ux/g, 'uiux']
	];

	/* Text helpers ------------------------------------------------------ */

	function clean(text) {
		var s = String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
		PRE_REPLACE.forEach(function (r) { s = s.replace(r[0], r[1]); });
		return s.replace(/[^a-z0-9]+/g, ' ').trim();
	}

	function rawTokens(text) {
		var s = clean(text);
		return s ? s.split(' ') : [];
	}

	// Light stemming for English and Indonesian suffixes. It only needs to be
	// consistent: patterns and questions go through the same function.
	function stem(w) {
		if (/^\d+$/.test(w)) return w;
		if (w.length > 5) w = w.replace(/(nya|lah|kah)$/, '');
		if (w.length > 6) w = w.replace(/kan$/, '');
		if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
		if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
		if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
		if (w.length > 3 && /s$/.test(w) && !/(ss|us|is|js)$/.test(w)) return w.slice(0, -1);
		return w;
	}

	function levenshtein(a, b, max) {
		if (Math.abs(a.length - b.length) > max) return max + 1;
		var prev = [], cur = [], i, j;
		for (j = 0; j <= b.length; j++) prev[j] = j;
		for (i = 1; i <= a.length; i++) {
			cur = [i];
			var rowMin = i;
			for (j = 1; j <= b.length; j++) {
				cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
				if (cur[j] < rowMin) rowMin = cur[j];
			}
			if (rowMin > max) return max + 1;
			prev = cur;
		}
		return prev[b.length];
	}

	function pick(list) {
		if (!Array.isArray(list)) return list;
		return list[Math.floor(Math.random() * list.length)];
	}

	function fill(template, vars) {
		return String(template).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
	}

	function uniq(list) {
		var seen = Object.create(null);
		return list.filter(function (x) { if (seen[x]) return false; seen[x] = true; return true; });
	}

	function joinKey(words) { return words.join(''); }

	/* Engine ------------------------------------------------------------ */

	function create(options) {
		var kb = options.kb;
		var page = options.page || {};
		var profile = kb.profile || {};
		var strings = kb.strings || {};

		// Synonyms: single words and multi-word phrases map to a canonical token
		var syn = Object.create(null);
		var phraseSyn = []; // [{words:[...], canon}]
		Object.keys(kb.synonyms || {}).forEach(function (canon) {
			syn[canon] = canon;
			kb.synonyms[canon].forEach(function (variant) {
				var words = rawTokens(variant);
				if (!words.length) return;
				if (words.length === 1) {
					syn[words[0]] = canon;
					syn[stem(words[0])] = syn[stem(words[0])] || canon;
				} else {
					phraseSyn.push({ words: words, canon: canon });
				}
			});
		});
		phraseSyn.sort(function (a, b) { return b.words.length - a.words.length; });

		/* Entities (from the page) */
		var entities = buildEntities(page, kb);
		var entityKeys = Object.create(null); // key -> [entity]
		entities.forEach(function (e) {
			e.keys.forEach(function (k) { (entityKeys[k] = entityKeys[k] || []).push(e); });
		});

		var vocab = Object.create(null); // canonical tokens known to intents (typo targets)

		function canonical(word) {
			if (syn[word]) return syn[word];
			var s = stem(word);
			if (syn[s]) return syn[s];
			return s;
		}

		function correct(word) {
			// Short words are too easy to "correct" into something else (real → read)
			if (word.length < 5 || vocab[word] || STOPWORDS[word] || NAME_WORDS[word] || entityKeys[word]) return word;
			var max = word.length >= 8 ? 2 : 1, best = null, bestD = max + 1;
			for (var v in vocab) {
				if (v.length < 4) continue;
				var d = levenshtein(word, v, max);
				if (d < bestD) { bestD = d; best = v; }
			}
			return best || word;
		}

		// Raw tokens → canonical tokens (phrase synonyms first, then words)
		function analyse(text, withTypo) {
			var raw = rawTokens(text);
			var out = [];
			for (var i = 0; i < raw.length;) {
				var hit = null;
				for (var p = 0; p < phraseSyn.length; p++) {
					var w = phraseSyn[p].words;
					if (i + w.length <= raw.length && w.every(function (x, k) { return raw[i + k] === x; })) { hit = phraseSyn[p]; break; }
				}
				if (hit) { out.push(hit.canon); i += hit.words.length; continue; }
				var tok = raw[i];
				i++;
				if (tok.length < 2) continue;
				var c = STOPWORDS[tok] ? tok : canonical(tok);
				if (withTypo && !syn[tok] && !STOPWORDS[tok]) c = correct(c);
				out.push(c);
			}
			return { raw: raw, all: out, content: out.filter(function (t) { return !STOPWORDS[t] && !NAME_WORDS[t]; }) };
		}

		/* Intent index */
		var intents = kb.intents.map(function (it) {
			var tokens = Object.create(null), phrases = [];
			(it.patterns || []).forEach(function (pattern) {
				var a = analyse(pattern, false).content;
				a.forEach(function (t) { tokens[t] = true; vocab[t] = true; });
				if (a.length > 1) phrases.push(a);
			});
			return { def: it, id: it.id, tokens: tokens, phrases: phrases };
		});
		Object.keys(syn).forEach(function (k) { vocab[syn[k]] = true; });
		var byId = Object.create(null);
		intents.forEach(function (it) { byId[it.id] = it; });

		var df = Object.create(null);
		intents.forEach(function (it) { Object.keys(it.tokens).forEach(function (t) { df[t] = (df[t] || 0) + 1; }); });
		var N = intents.length;
		function idf(t) { return df[t] ? Math.log(1 + N / df[t]) : 0.5 * Math.log(1 + N); }

		/* Services (from kb) keyed by canonical keyword */
		var serviceByKeyword = Object.create(null);
		(kb.services || []).forEach(function (s) {
			s.keywords.forEach(function (k) { serviceByKeyword[canonical(k)] = s; });
		});

		/* Page search index (fallback) */
		var docs = (page.docs || []).map(function (d) {
			var toks = Object.create(null);
			analyse(d.title + ' ' + d.text, false).content.forEach(function (t) { toks[t] = true; });
			return { doc: d, tokens: toks };
		});
		var docDf = Object.create(null);
		docs.forEach(function (d) { Object.keys(d.tokens).forEach(function (t) { docDf[t] = (docDf[t] || 0) + 1; }); });
		function docIdf(t) { return docDf[t] ? Math.log(1 + docs.length / docDf[t]) : 0; }

		/* Language */
		function detectLang(raw, prev) {
			var id = 0, en = 0;
			raw.forEach(function (w) { if (LANG_ID[w]) id++; if (LANG_EN[w]) en++; });
			if (id > en) return 'id';
			if (en > id) return 'en';
			return prev || 'en';
		}

		/* Entity extraction: n-grams (1–4 words) joined without spaces */
		// Returns the entities plus which word positions they cover
		function findEntities(raw) {
			var found = [], seen = Object.create(null), covered = Object.create(null);
			for (var n = 4; n >= 1; n--) {
				for (var i = 0; i + n <= raw.length; i++) {
					var key = joinKey(raw.slice(i, i + n));
					var keys = [key];
					if (key.length > 3 && /s$/.test(key)) keys.push(key.slice(0, -1));
					keys.forEach(function (k) {
						var hits = entityKeys[k];
						if (!hits) return;
						for (var c = i; c < i + n; c++) covered[c] = true;
						hits.forEach(function (e) { if (!seen[e.uid]) { seen[e.uid] = true; found.push(e); } });
					});
				}
			}
			return { list: found, covered: covered };
		}

		function findServices(content) {
			var out = [];
			content.forEach(function (t) { if (serviceByKeyword[t] && out.indexOf(serviceByKeyword[t]) < 0) out.push(serviceByKeyword[t]); });
			return out;
		}

		/* Scoring */
		function scoreIntents(content, excluded) {
			var q = uniq(content.filter(function (t) { return !excluded[t]; }));
			var total = q.reduce(function (s, t) { return s + idf(t); }, 0);
			return intents.map(function (it) {
				if (!q.length) return { id: it.id, score: 0 };
				var matched = q.filter(function (t) { return it.tokens[t]; });
				var cov = matched.reduce(function (s, t) { return s + idf(t); }, 0) / total;
				var phrase = it.phrases.some(function (ph) {
					for (var i = 0; i + ph.length <= content.length; i++) {
						if (ph.every(function (x, k) { return content[i + k] === x; })) return true;
					}
					return false;
				}) ? 0.25 : 0;
				// A "strong" token (e.g. price, time) almost always decides the intent
				var strong = (it.def.strong || []).some(function (t) { return q.indexOf(t) >= 0; }) ? 0.75 : 0;
				return { id: it.id, score: matched.length ? cov + phrase + strong : 0 };
			}).sort(function (a, b) { return b.score - a.score; });
		}

		function searchDocs(content) {
			var q = uniq(content);
			var total = q.reduce(function (s, t) { return s + (docIdf(t) || 1); }, 0);
			var best = null;
			docs.forEach(function (d) {
				var matched = q.filter(function (t) { return d.tokens[t]; });
				if (!matched.length) return;
				var cov = matched.reduce(function (s, t) { return s + docIdf(t); }, 0) / total;
				if (!best || cov > best.score) best = { doc: d.doc, score: cov };
			});
			return best;
		}

		var THRESHOLD = 0.45;
		var AMBIGUITY_GAP = 0.06;

		// Classify a message without composing a reply (also used by tests)
		function classify(text, state) {
			state = state || {};
			var a = analyse(text, true);
			var lang = detectLang(a.raw, state.lang);
			var entHits = findEntities(a.raw);
			var ents = entHits.list;
			var skills = ents.filter(function (e) { return e.type === 'skill'; });
			var projects = ents.filter(function (e) { return e.type === 'project'; });
			var services = findServices(a.content);

			// Tokens that belong to entities are not intent evidence
			var excluded = Object.create(null);
			Object.keys(entHits.covered).forEach(function (i) {
				var w = a.raw[i];
				excluded[w] = true;
				excluded[canonical(w)] = true;
				excluded[correct(canonical(w))] = true;
			});

			var ranked = scoreIntents(a.content, excluded);
			var scores = Object.create(null);
			ranked.forEach(function (r) { scores[r.id] = r.score; });

			// An unrecognised word next to "use / work with / know" is most likely a
			// technology we don't list (e.g. WordPress) — lean toward skill_check
			var unknown = a.content.some(function (t) { return !vocab[t] && !excluded[t] && !/^\d+$/.test(t); });
			if (unknown && scores.skill_check > 0) scores.skill_check += 0.05;

			// Entity floors: naming a skill / project / service is strong evidence
			if (skills.length) scores.skill_check = Math.max(scores.skill_check, 0.62);
			if (projects.length) scores.project_detail = Math.max(scores.project_detail, 0.64);
			if (services.length) scores.service_detail = Math.max(scores.service_detail, 0.66);

			ranked = Object.keys(scores).map(function (id) { return { id: id, score: scores[id] }; })
				.sort(function (a, b) { return b.score - a.score || order(a.id) - order(b.id); });

			var top = ranked[0], second = ranked[1];
			var intent = top.score >= THRESHOLD ? top.id : null;
			var greeting = false;

			// Small talk next to a real question: answer the question, greet in passing
			if (intent && byId[intent].def.minor) {
				var real = ranked.filter(function (r) { return !byId[r.id].def.minor && r.score >= THRESHOLD; })[0];
				if (real) { greeting = intent === 'greeting'; intent = real.id; }
			}

			// A named entity makes the generic answer specific
			if (intent === 'services' && services.length) intent = 'service_detail';
			if (intent === 'projects' && projects.length) intent = 'project_detail';
			if (skills.length && !services.length && (intent === 'experience' || intent === 'skills' || intent === 'projects')) intent = 'skill_check';

			// Only a name / "about" with nothing else → about
			if (!intent && !a.content.length && a.raw.some(function (w) { return NAME_WORDS[w] || ABOUT_HINTS[w]; })) intent = 'about';

			var ambiguous = null;
			if (intent && second && second.score >= THRESHOLD && second.id !== intent &&
				top.score - second.score < AMBIGUITY_GAP && !byId[second.id].def.minor &&
				!skills.length && !projects.length && !services.length) {
				ambiguous = [top.id, second.id];
			}

			return {
				intent: intent, score: top.score, ranked: ranked.slice(0, 4), lang: lang, greeting: greeting,
				ambiguous: ambiguous, skills: skills, projects: projects, services: services, tokens: a.content
			};
		}

		function order(id) { return kb.intents.findIndex(function (i) { return i.id === id; }); }

		/* Reply composition ------------------------------------------------ */

		function str(key, lang, vars) {
			var s = strings[key];
			if (!s) return '';
			return fill(s[lang] || s.en, Object.assign({ email: profile.email, location: profile.location, timezone: profile.timezone }, vars || {}));
		}

		function label(intentId, lang) {
			var def = byId[intentId] && byId[intentId].def;
			return def && def.label ? (def.label[lang] || def.label.en) : intentId;
		}

		function quick(ids, lang) {
			return (ids || []).filter(function (id) { return byId[id]; }).map(function (id) { return { label: label(id, lang), intent: id }; });
		}

		function sectionAction(id, lang) {
			var labels = (strings.actionSection || {})[id] || {};
			return { type: 'section', target: id, label: labels[lang] || labels.en || id };
		}

		function actionsFor(list, lang) {
			return (list || []).map(function (a) {
				if (a.indexOf('section:') === 0) return sectionAction(a.slice(8), lang);
				if (a === 'email') return { type: 'email', label: str('actionEmail', lang), href: 'mailto:' + profile.email };
				if (a === 'copy') return { type: 'copy', label: str('actionCopy', lang), value: profile.email };
				if (a === 'hire') return { type: 'intent', label: str('actionHire', lang), intent: 'hire' };
				return null;
			}).filter(Boolean);
		}

		function bullet(lines) { return lines.map(function (l) { return '• ' + l; }).join('\n'); }

		function projectLine(p) { return p.data.title + (p.data.meta ? ' — ' + p.data.meta : ''); }

		function projectsForService(service) {
			var rel = service.related || {};
			return entities.filter(function (e) {
				if (e.type !== 'project') return false;
				if (rel.category) return e.data.category === rel.category;
				if (rel.tags) return rel.tags.some(function (t) { return (e.data.tags || []).indexOf(t) >= 0; });
				if (rel.roleIncludes) return (e.data.role || '').indexOf(rel.roleIncludes) >= 0;
				return false;
			});
		}

		function projectsForSkill(skill) {
			var name = skill.data.name.toLowerCase();
			return entities.filter(function (e) {
				return e.type === 'project' && (e.data.tags || []).some(function (t) { return t.toLowerCase() === name; });
			});
		}

		var builders = {
			experience: function (c, lang) {
				var lines = (page.experience || []).map(function (x) {
					var roles = (x.roles || []).map(function (r) { return r.title; }).join(', ');
					return x.org + ' (' + x.date + ')' + (roles ? ': ' + roles : '');
				});
				return { text: str('experienceIntro', lang) + '\n' + bullet(lines) };
			},
			education: function (c, lang) {
				var lines = (page.education || []).map(function (x) { return x.title + ' — ' + x.place + ' (' + x.date + ')'; });
				return { text: str('educationIntro', lang) + '\n' + bullet(lines) };
			},
			awards: function (c, lang) {
				var lines = (page.recognition || []).map(function (x) { return x.title + ' — ' + x.place + ' (' + x.date + ')'; });
				return { text: str('awardsIntro', lang) + '\n' + bullet(lines) };
			},
			skills: function (c, lang) {
				var lines = (page.skillGroups || []).map(function (g) { return g.name + ': ' + g.skills.slice(0, 6).join(', '); });
				return { text: str('skillsIntro', lang) + '\n' + bullet(lines) };
			},
			skill_check: function (c, lang) {
				if (!c.skills.length) return { text: str('skillUnknown', lang), actions: [sectionAction('skills', lang)] };
				var text;
				if (c.skills.length === 1) text = str('skillYes', lang, { skill: c.skills[0].data.name, group: c.skills[0].data.group });
				else text = str('skillYesMany', lang, { skills: c.skills.map(function (s) { return s.data.name; }).join(', ') });
				var used = uniq([].concat.apply([], c.skills.map(projectsForSkill))).slice(0, 4);
				if (used.length) text += '\n' + str('skillUsedIn', lang) + '\n' + bullet(used.map(function (p) { return p.data.title; }));
				return { text: text, actions: [sectionAction('skills', lang)], quick: quick(['projects', 'hire'], lang) };
			},
			projects: function (c, lang) {
				var all = entities.filter(function (e) { return e.type === 'project'; });
				var ent = all.filter(function (e) { return e.data.kind === 'enterprise'; });
				var free = all.filter(function (e) { return e.data.kind !== 'enterprise'; });
				var picks = ent.slice(0, 2).concat(free.slice(0, 3));
				return {
					text: str('projectsIntro', lang, { enterprise: ent.length, freelance: free.length }) + '\n' + bullet(picks.map(projectLine))
				};
			},
			project_detail: function (c, lang) {
				var list = c.projects.length ? c.projects : (c.lastProject ? [c.lastProject] : []);
				if (!list.length) return builders.projects(c, lang);
				if (list.length === 1) {
					var p = list[0];
					var actions = [{ type: 'ref', ref: p.data.ref, label: str('actionView', lang) + ' — ' + p.data.title }];
					if (p.data.image) actions.push({ type: 'image', ref: p.data.ref, label: lang === 'id' ? 'Lihat screenshot' : 'View screenshot' });
					return {
						text: p.data.title + (p.data.meta ? ' (' + p.data.meta + ')' : '') + '\n' + p.data.desc +
							((p.data.tags || []).length ? '\n' + (p.data.tags.join(' · ')) : ''),
						actions: actions, entity: p
					};
				}
				return {
					text: str('projectFound', lang) + '\n' + bullet(list.slice(0, 5).map(projectLine)),
					actions: list.slice(0, 3).map(function (p) { return { type: 'ref', ref: p.data.ref, label: p.data.title }; })
				};
			},
			services: function (c, lang) {
				var lines = (kb.services || []).map(function (s) { return s.title[lang] || s.title.en; });
				return { text: str('servicesIntro', lang) + '\n' + bullet(lines) + '\n' + str('serviceCta', lang), actions: actionsFor(['hire'], lang) };
			},
			service_detail: function (c, lang) {
				var s = c.services[0] || c.lastService;
				if (!s) return builders.services(c, lang);
				var text = (s.title[lang] || s.title.en) + '\n' + (s.desc[lang] || s.desc.en);
				var examples = projectsForService(s).slice(0, 3);
				if (examples.length) text += '\n' + str('serviceExamples', lang) + '\n' + bullet(examples.map(function (p) { return p.data.title; }));
				text += '\n' + str('serviceCta', lang);
				return { text: text, actions: actionsFor(['hire'], lang), service: s };
			},
			certificates: function (c, lang) {
				var lines = (page.certificates || []).map(function (x) { return x.title + ' — ' + x.issuer; });
				return { text: str('certificatesIntro', lang) + '\n' + bullet(lines) };
			},
			articles: function (c, lang) {
				var list = (page.articles || []).slice(0, 3);
				if (!list.length) return { text: str('articlesNone', lang) };
				return {
					text: str('articlesIntro', lang) + '\n' + bullet(list.map(function (a) { return a.title; })),
					actions: list.map(function (a) { return { type: 'link', href: a.link, label: a.title.length > 38 ? a.title.slice(0, 36) + '…' : a.title }; })
				};
			},
			pricing: function (c, lang) {
				var def = byId.pricing.def;
				var text = pick(def.answer[lang] || def.answer.en);
				var s = c.services[0] || c.lastService;
				if (s) text = str('pricingFor', lang, { service: s.title[lang] || s.title.en }) + ' ' + text;
				return { text: text, service: s };
			}
		};

		/* Hire flow (a small state machine) */
		var flow = kb.hireFlow;

		function flowStep(state, lang) {
			var step = flow.steps[state.flow.step];
			var options;
			if (step.options === 'services') {
				options = (kb.services || []).map(function (s) { return s.title[lang] || s.title.en; })
					.concat((step.extra || []).map(function (o) { return o[lang] || o.en; }));
			} else {
				options = (step.options || []).map(function (o) { return o[lang] || o.en; });
			}
			if (step.skippable) options.push(str('skip', lang));
			return {
				text: step.ask[lang] || step.ask.en,
				quick: options.map(function (o) { return { label: o, value: o }; }).concat([{ label: str('cancel', lang), value: '__cancel' }]),
				expectsText: true
			};
		}

		function flowSummary(data, lang) {
			var labels = flow.labels;
			var lines = flow.steps.map(function (s) {
				var v = data[s.key];
				return v ? (labels[s.key][lang] || labels[s.key].en) + ': ' + v : null;
			}).filter(Boolean);
			var subject = fill(flow.emailSubject[lang] || flow.emailSubject.en, { type: data.type || '—' });
			var body = (flow.emailIntro[lang] || flow.emailIntro.en) + '\n\n' + lines.join('\n') + '\n\n' + (flow.emailOutro[lang] || flow.emailOutro.en);
			return {
				text: (flow.done[lang] || flow.done.en) + '\n\n' + lines.join('\n'),
				actions: [
					{ type: 'email', label: str('actionSendBrief', lang), href: 'mailto:' + profile.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), primary: true },
					{ type: 'copy', label: str('actionCopy', lang), value: profile.email }
				]
			};
		}

		function isCancel(text) {
			var a = analyse(text, false);
			return a.all.indexOf('cancel') >= 0 && a.content.length <= 2;
		}
		function isSkip(text, lang) {
			var a = analyse(text, false);
			return (a.all.indexOf('skip') >= 0 && a.content.length <= 2) || clean(text) === clean(str('skip', lang));
		}

		function handleFlow(text, value, state) {
			var lang = state.lang || 'en';
			if (value === '__cancel' || isCancel(text)) {
				return finish({ text: flow.cancelled[lang] || flow.cancelled.en, quick: quick(['services', 'projects', 'contact'], lang) }, Object.assign({}, state, { flow: null }), 'hire_cancel');
			}
			var step = flow.steps[state.flow.step];
			var answer = String(text || '').trim().slice(0, 300);
			var data = Object.assign({}, state.flow.data);
			data[step.key] = step.skippable && isSkip(answer, lang) ? '' : answer;
			var next = { name: 'hire', step: state.flow.step + 1, data: data };
			if (next.step >= flow.steps.length) {
				return finish(flowSummary(data, lang), Object.assign({}, state, { flow: null }), 'hire_done');
			}
			var st = Object.assign({}, state, { flow: next });
			return finish(flowStep(st, lang), st, 'hire');
		}

		function finish(reply, state, intent, meta) {
			reply.intent = intent;
			reply.state = state;
			if (meta) reply.meta = meta;
			return reply;
		}

		function startFlow(state, lang) {
			var st = Object.assign({}, state, { lang: lang, flow: { name: 'hire', step: 0, data: {} } });
			var first = flowStep(st, lang);
			first.text = (flow.intro[lang] || flow.intro.en) + '\n\n' + first.text;
			return finish(first, st, 'hire');
		}

		// Main entry: text (and optionally a quick-reply payload) → reply + new state
		function reply(text, opts) {
			opts = opts || {};
			var state = Object.assign({ lang: null, flow: null, lastIntent: null, lastService: null, lastProject: null }, opts.state || {});

			if (state.flow) return handleFlow(text, opts.value, state);

			var c;
			if (opts.intent) {
				c = { intent: opts.intent, lang: state.lang || detectLang(rawTokens(text)), skills: [], projects: [], services: [], score: 1 };
			} else {
				c = classify(text, state);
			}
			var lang = c.lang;
			state.lang = lang;

			if (c.intent === 'hire') return startFlow(state, lang);

			// Follow-ups ("how much?") reuse the service/project from the last answer
			c.lastService = state.lastService ? (kb.services || []).find(function (s) { return s.id === state.lastService; }) : null;
			c.lastProject = state.lastProject ? entities.find(function (e) { return e.uid === state.lastProject; }) : null;

			if (c.ambiguous) {
				return finish({ text: str('clarify', lang), quick: quick(c.ambiguous, lang) }, state, 'clarify', c);
			}

			if (!c.intent) {
				var hit = searchDocs(c.tokens || []);
				if (hit && hit.score >= 0.6) {
					var d = hit.doc;
					return finish({
						text: str('foundOnPage', lang) + '\n' + d.title + '\n' + (d.text.length > 220 ? d.text.slice(0, 217).replace(/\s+\S*$/, '') + '…' : d.text),
						actions: d.ref ? [{ type: 'ref', ref: d.ref, label: str('actionView', lang) }] : [],
						quick: quick(['services', 'contact'], lang)
					}, state, 'page_search', c);
				}
				return finish({
					text: str('fallback', lang),
					actions: actionsFor(['email'], lang),
					quick: quick(['services', 'projects', 'experience', 'contact'], lang)
				}, state, 'fallback', c);
			}

			var def = byId[c.intent].def;
			var out = builders[c.intent] ? builders[c.intent](c, lang) : { text: fill(pick(def.answer[lang] || def.answer.en), { email: profile.email, location: profile.location, timezone: profile.timezone }) };
			if (c.greeting) out.text = str('hiPrefix', lang) + out.text;
			out.actions = (out.actions || []).concat(actionsFor(def.actions, lang)).filter(function (a, i, arr) {
				return arr.findIndex(function (b) { return b.type === a.type && (b.target || b.href || b.intent) === (a.target || a.href || a.intent) && b.label === a.label; }) === i;
			}).slice(0, 3);
			out.quick = out.quick || quick(def.quick, lang);

			state.lastIntent = c.intent;
			if (out.service) state.lastService = out.service.id;
			if (out.entity) state.lastProject = out.entity.uid;
			delete out.service; delete out.entity;
			return finish(out, state, c.intent, c);
		}

		function welcome(lang) {
			lang = lang || 'en';
			return {
				text: str('welcome', lang),
				quick: quick(['about', 'services', 'projects', 'pricing', 'hire'], lang),
				intent: 'welcome'
			};
		}

		return { reply: reply, classify: classify, welcome: welcome, analyse: analyse, entities: entities };
	}

	/* Entity building --------------------------------------------------- */

	var GENERIC = wordSet(
		'global corporate enterprise national international digital platform website system page landing information management' +
		' content review online course value dashboard prediction product promotional technology refresh revamp migration and the' +
		' web app apps for of user design data systems testing research visualization responsive technical documentation' +
		' effort estimation requirement analysis server rest api apis ways working toolbox developer developers'
	);

	function keysFor(name, opts) {
		var parts = String(name).split(/\s*[\/—–]\s*|\s+-\s+/);
		var keys = [];
		parts.forEach(function (part, idx) {
			var words = rawTokens(part);
			if (!words.length) return;
			if (opts.headOnly && idx > 0) return;
			var full = joinKey(words);
			if (full.length >= 2) keys.push(full);
			if (full.length > 3 && /s$/.test(full)) keys.push(full.slice(0, -1));
			if (words.length > 1 && words.length <= (opts.maxWords || 3)) {
				words.forEach(function (w) { if (w.length >= (opts.minWord || 3) && !GENERIC[w] && !STOPWORDS[w]) keys.push(w); });
			}
		});
		return uniq(keys).filter(function (k) { return k.length >= 2 && !STOPWORDS[k]; });
	}

	function buildEntities(page, kb) {
		var list = [], uid = 0;
		var aliases = (kb && kb.skillAliases) || {};
		(page.skillGroups || []).forEach(function (g) {
			g.skills.forEach(function (name) {
				var keys = keysFor(name, { maxWords: 2, minWord: 4 });
				(aliases[name] || []).forEach(function (a) { keys.push(joinKey(rawTokens(a))); });
				if (!keys.length || name.length < 2) return;
				list.push({ uid: 's' + (uid++), type: 'skill', keys: keys, data: { name: name, group: g.name } });
			});
		});
		(page.projects || []).forEach(function (p) {
			var keys = keysFor(p.title, { headOnly: true, maxWords: 6, minWord: 3 });
			(p.aliases || []).forEach(function (a) { keys.push(joinKey(rawTokens(a))); });
			list.push({ uid: 'p' + (uid++), type: 'project', keys: uniq(keys), data: p });
		});
		return list;
	}

	return { create: create, _internal: { clean: clean, stem: stem, levenshtein: levenshtein, keysFor: keysFor } };
});
