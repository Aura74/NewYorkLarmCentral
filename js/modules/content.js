/* content.js — data-driven sections: "in the atelier this week", stories (case studies),
   the team, the journal — plus the reader modal for stories and articles. */
import { DATA } from '../data.js';
import { refreshIcons } from './env.js';
import { t, pickField, locale, currentLang } from './i18n.js';
import { openModal } from './ui.js';

const IMG = (base, w, q = 78) => `${base}?w=${w}&q=${q}&auto=format`;
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(locale(), { day: 'numeric', month: 'short' });

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

/* ---- Reader modal (shared by stories and journal) ---- */
const reader = document.getElementById('reader');
function openReader({ image, kicker, title, meta, sections }) {
    if (!reader) return;
    const img = document.getElementById('reader-img');
    img.src = IMG(image, 1400);
    img.alt = title;
    document.getElementById('reader-kicker').textContent = kicker || '';
    document.getElementById('reader-title').textContent = title || '';
    document.getElementById('reader-meta').textContent = meta || '';
    const content = document.getElementById('reader-content');
    content.replaceChildren();
    sections.forEach(([label, paragraphs]) => {
        if (label) content.append(el('span', 'reader-section-label', label));
        paragraphs.forEach((p) => content.append(el('p', null, p)));
    });
    const panel = reader.querySelector('.reader-panel');
    if (panel) panel.scrollTop = 0;
    openModal(reader);
}

/* ---- In the atelier this week ---- */
let openPiece = null;
function renderNow() {
    const row = document.getElementById('now-row');
    if (!row) return;
    row.replaceChildren();
    (DATA.inAtelier || []).forEach(({ id, until }) => {
        const it = (DATA.instruments || {})[id];
        if (!it) return;
        const b = el('button', 'now-item');
        b.type = 'button';
        b.append(el('span', null, pickField(it, 'title')), el('small', null, t('now.until') + ' ' + fmtShort(until)));
        b.addEventListener('click', () => { if (openPiece) openPiece(id); });
        row.append(b);
    });
}

/* ---- Stories ---- */
function renderStories() {
    const grid = document.getElementById('stories-grid');
    if (!grid) return;
    grid.replaceChildren();
    (DATA.stories || []).forEach((s) => {
        const card = el('button', 'story-card');
        card.type = 'button';
        const img = el('img'); img.src = IMG(s.image, 800); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
        const body = el('div', 'story-body');
        body.append(
            el('span', 'story-place', pickField(s, 'place')),
            el('h3', null, pickField(s, 'title')),
            el('p', 'story-excerpt', pickField(s, 'brief')),
            el('span', 'story-more', t('stories.read') + ' →'),
        );
        card.append(img, body);
        card.addEventListener('click', () => openReader({
            image: s.image, kicker: pickField(s, 'place'), title: pickField(s, 'title'), meta: '',
            sections: [[t('story.brief'), [pickField(s, 'brief')]], [t('story.work'), [pickField(s, 'work')]], [t('story.result'), [pickField(s, 'result')]]],
        }));
        grid.append(card);
    });
}

/* ---- Team ---- */
function renderTeam() {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    grid.replaceChildren();
    (DATA.technicians || []).forEach((p) => {
        const card = el('article', 'team-card');
        const img = el('img'); img.src = IMG(p.photo, 400); img.alt = p.name; img.loading = 'lazy'; img.decoding = 'async';
        card.append(
            img,
            el('h3', null, p.name),
            el('span', 'team-role', pickField(p, 'role')),
            el('p', 'team-bio', pickField(p, 'bio')),
            el('p', 'team-quote', '“' + pickField(p, 'quote') + '”'),
            el('span', 'team-years', p.years + ' ' + t('team.years')),
        );
        grid.append(card);
    });
}

/* ---- Journal ---- */
function renderJournal() {
    const grid = document.getElementById('journal-grid');
    if (!grid) return;
    grid.replaceChildren();
    (DATA.journal || []).forEach((a) => {
        const card = el('button', 'journal-card');
        card.type = 'button';
        const img = el('img'); img.src = IMG(a.image, 640); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
        const meta = fmtDate(a.date) + ' · ' + a.minutes + ' ' + t('journal.min');
        card.append(img, el('span', 'journal-meta', meta), el('h3', null, pickField(a, 'title')), el('p', 'journal-excerpt', pickField(a, 'excerpt')));
        card.addEventListener('click', () => openReader({
            image: a.image, kicker: t('journal.tag'), title: pickField(a, 'title'), meta,
            sections: [[null, pickField(a, 'body') || a.body]],
        }));
        grid.append(card);
    });
}

export function init({ openDossier } = {}) {
    openPiece = openDossier || null;
    const closeBtn = document.getElementById('reader-close');
    if (closeBtn && reader) closeBtn.addEventListener('click', () => reader.dispatchEvent(new CustomEvent('lr:close', { bubbles: true })));
    const renderAll = () => { renderNow(); renderStories(); renderTeam(); renderJournal(); refreshIcons(); };
    renderAll();
    document.addEventListener('lr:lang', renderAll);
    void currentLang;
}
