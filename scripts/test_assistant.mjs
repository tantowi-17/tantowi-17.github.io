#!/usr/bin/env node
// Checks the chat assistant's intent matching against tests/assistant-cases.json.
// Page data is read from index.html the same way js/chat.js reads it from the DOM.
//
//   node scripts/test_assistant.mjs            # summary + failures
//   node scripts/test_assistant.mjs --verbose  # every case with its scores
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ChatEngine = require(join(root, 'js/chat-engine.js'));

const html = readFileSync(join(root, 'index.html'), 'utf8');
const kb = JSON.parse(readFileSync(join(root, 'data/assistant.json'), 'utf8'));
const articles = JSON.parse(readFileSync(join(root, 'data/articles.json'), 'utf8')).items;
const cases = JSON.parse(readFileSync(join(root, 'tests/assistant-cases.json'), 'utf8'));
const verbose = process.argv.includes('--verbose');

const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/\s+/g, ' ').trim();
const all = (re, s) => [...s.matchAll(re)];

function readPage() {
	const skillGroups = all(/<div class="skill-group[^"]*">\s*<h3>([\s\S]*?)<\/h3>\s*<ul class="tags">([\s\S]*?)<\/ul>/g, html)
		.map((m) => ({ name: text(m[1]), skills: all(/<li>([\s\S]*?)<\/li>/g, m[2]).map((x) => text(x[1])) }));

	const cases = all(/<article class="case[^"]*">([\s\S]*?)<\/article>/g, html).map((m) => {
		const b = m[1];
		const meta = all(/<span>([\s\S]*?)<\/span>/g, (b.match(/<p class="case-meta">([\s\S]*?)<\/p>/) || [])[1] || '').map((x) => text(x[1]));
		return {
			kind: 'enterprise',
			title: text(b.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
			role: text((b.match(/<p class="case-role">([\s\S]*?)<\/p>/) || [])[1] || ''),
			meta: meta.join(' · '),
			desc: text((b.match(/<\/header>\s*<p>([\s\S]*?)<\/p>/) || [])[1] || ''),
			tags: all(/<li>([\s\S]*?)<\/li>/g, (b.match(/<ul class="tags">([\s\S]*?)<\/ul>/) || [])[1] || '').map((x) => text(x[1])),
		};
	});

	const projects = all(/<li class="project[^"]*" data-category="(\w+)">([\s\S]*?)<\/div>\s*<\/li>/g, html).map((m) => ({
		kind: 'project',
		category: m[1],
		title: text(m[2].match(/<h3>([\s\S]*?)<\/h3>/)[1]),
		meta: text(m[2].match(/<p class="project-type">([\s\S]*?)<\/p>/)[1]),
		desc: text(m[2].match(/<h3>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/)[1]),
		image: true,
		tags: [],
	}));

	const timeline = (heading) => {
		const block = (html.match(new RegExp('<h3 class="exp-heading">' + heading + '</h3>\\s*<ol class="timeline">([\\s\\S]*?)</ol>')) || [])[1] || '';
		return block.split('<li class="reveal">').slice(1).map((li) => ({
			date: text((li.match(/<p class="tl-date">([\s\S]*?)<\/p>/) || [])[1] || ''),
			org: text(((li.match(/<h4>([\s\S]*?)<\/h4>/) || [])[1] || '').replace(/<span[\s\S]*<\/span>/, '')),
			title: text(((li.match(/<h4>([\s\S]*?)<\/h4>/) || [])[1] || '')),
			place: text((li.match(/<p class="tl-place">([\s\S]*?)<\/p>/) || [])[1] || ''),
			roles: all(/<li><span>([\s\S]*?)<\/span>(?:<span class="mono">([\s\S]*?)<\/span>)?<\/li>/g, li).map((r) => ({ title: text(r[1]), date: r[2] ? text(r[2]) : '' })),
		}));
	};

	const certificates = all(/<div class="cert-body"><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><\/div>/g, html)
		.map((m) => ({ title: text(m[1]), issuer: text(m[2]) }));

	const allProjects = cases.concat(projects);
	return {
		skillGroups,
		projects: allProjects,
		experience: timeline('Work'),
		education: timeline('Education'),
		recognition: timeline('Recognition'),
		certificates,
		articles,
		docs: allProjects.map((p) => ({ title: p.title, text: p.desc })),
	};
}

const engine = ChatEngine.create({ kb, page: readPage() });

let pass = 0;
const failures = [];
for (const c of cases) {
	const r = engine.classify(c.q, {});
	let ok = r.intent === c.intent || (c.allow || []).includes(r.intent);
	if (ok && c.skill) ok = r.skills.some((s) => s.data.name === c.skill);
	if (ok && c.service) ok = r.services.some((s) => s.id === c.service);
	if (ok) pass++;
	else failures.push({ c, r });
	if (verbose) {
		console.log(`${ok ? '✓' : '✗'} ${c.q.padEnd(48)} → ${String(r.intent).padEnd(15)} [${r.lang}] ` +
			r.ranked.slice(0, 3).map((x) => `${x.id}:${x.score.toFixed(2)}`).join(' ') +
			(r.skills.length ? ` skills=${r.skills.map((s) => s.data.name)}` : '') +
			(r.services.length ? ` services=${r.services.map((s) => s.id)}` : '') +
			(r.projects.length ? ` projects=${r.projects.length}` : ''));
	}
}

if (!verbose) {
	for (const { c, r } of failures) {
		console.log(`✗ "${c.q}" expected ${c.intent}${c.skill ? ' (' + c.skill + ')' : ''}${c.service ? ' (' + c.service + ')' : ''}` +
			` got ${r.intent} — tokens [${r.tokens.join(', ')}] top ${r.ranked.slice(0, 3).map((x) => x.id + ':' + x.score.toFixed(2)).join(' ')}`);
	}
}

// Smoke-test full replies, including the hire flow
let state = {};
let reply = engine.reply('I want to hire you', { state });
for (const answer of ['Web apps & dashboards', 'An inventory dashboard for my shop', 'Flexible', 'Not sure yet', 'Rina']) {
	reply = engine.reply(answer, { state: reply.state, value: answer });
}
const mail = (reply.actions || []).find((a) => a.type === 'email');
const flowOk = reply.intent === 'hire_done' && mail && mail.href.startsWith('mailto:tantowibowo7@gmail.com?subject=');
console.log(`\nHire flow: ${flowOk ? 'ok' : 'FAILED'}`);

const pct = ((pass / cases.length) * 100).toFixed(1);
console.log(`Intent accuracy: ${pass}/${cases.length} (${pct}%)`);
process.exit(pass / cases.length >= 0.9 && flowOk ? 0 : 1);
