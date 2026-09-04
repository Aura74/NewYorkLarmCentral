/* collection.js — the collection cards: filters, currency, wishlist, saved drawer,
   recently viewed, dossier (with View Transitions), gallery lightbox, search. */
import { DATA } from '../data.js';
import { isLite, hasGsap, reducedMotion, store, refreshIcons, $, $$ } from './env.js';
import { t, currentLang, pickField } from './i18n.js';
import { toast, openModal, closeModal, isModalOpen } from './ui.js';

const instruments = DATA.instruments || {};
const currencies = DATA.currencies || {};
let activeCurrency = store.get('lr-currency', DATA.baseCurrency || 'EUR');

/* ---- Currency ---- */
function formatMoney(eur, code) {
    const c = currencies[code] || currencies.EUR || { rate: 1, symbol: '€', position: 'before', locale: 'en-US' };
    const num = Math.round(eur * c.rate).toLocaleString(c.locale || 'en-US');
    return c.position === 'after' ? num + c.symbol : c.symbol + num;
}
export function applyCurrency(code) {
    activeCurrency = code;
    store.set('lr-currency', code);
    $$('[data-eur]').forEach((el) => { el.textContent = formatMoney(Number(el.dataset.eur), code); });
}
export const getCurrency = () => activeCurrency;
function priceToCurrency(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('[data-eur]').forEach((el) => { el.textContent = formatMoney(Number(el.dataset.eur), activeCurrency); });
    return tmp.innerHTML;
}

/* ---- Small builders (no innerHTML with data) ---- */
function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}
function thumb(it, w, q) {
    const img = el('img');
    img.src = ((it.gallery || [])[0] || '') + `?w=${w}&q=${q}`;
    img.alt = '';
    img.loading = 'lazy';
    return img;
}

/* ---- Cards: show / hide with a filter ---- */
const cards = $$('.piece-card');
const grid = $('.piece-grid');
function showCard(card, show) {
    if (!hasGsap || isLite) {
        card.classList.toggle('is-hidden', !show);
        return;
    }
    if (show) {
        card.classList.remove('is-hidden');
        window.gsap.to(card, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
    } else {
        window.gsap.to(card, { opacity: 0, scale: 0.95, duration: 0.3, ease: 'expo.out', onComplete: () => card.classList.add('is-hidden') });
    }
}
const filterBtns = $$('.filter-btn');
export function applyFilter(filter) {
    filterBtns.forEach((b) => {
        const on = b.dataset.filter === filter;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (grid) grid.classList.toggle('show-all-mobile', filter === 'all');
    cards.forEach((card) => showCard(card, filter === 'all' || (card.dataset.category || '').includes(filter)));
}

/* ---- Wishlist ---- */
const getSaved = () => store.get('lr-saved', []);
const isSaved = (id) => getSaved().includes(id);
function toggleSave(id) {
    let s = getSaved();
    if (s.includes(id)) { s = s.filter((x) => x !== id); toast(t('removedSaved'), 'heart'); }
    else { s.push(id); toast(t('saved') + (pickField(instruments[id], 'title') || t('instrument')), 'heart'); }
    store.set('lr-saved', s);
    syncSavedUI();
}
function syncSavedUI() {
    const s = getSaved();
    const count = document.getElementById('saved-count');
    if (count) { count.textContent = s.length; count.hidden = s.length === 0; }
    cards.forEach((card) => {
        const fav = card.querySelector('.piece-favorite');
        if (fav) fav.classList.toggle('favorited', s.includes(card.dataset.id));
    });
    syncDossierSave();
    renderSaved();
}

/* ---- Saved drawer ---- */
const savedDrawer = document.getElementById('saved-drawer');
function renderSaved() {
    const list = document.getElementById('saved-list');
    const empty = document.getElementById('saved-empty');
    if (!list) return;
    const s = getSaved();
    if (empty) empty.hidden = s.length > 0;
    list.replaceChildren();
    s.forEach((id) => {
        const it = instruments[id];
        if (!it) return;
        const item = el('div', 'saved-item');
        item.dataset.id = id;
        const txt = el('div');
        txt.append(el('h4', null, pickField(it, 'title')), el('p', null, pickField(it, 'kicker')));
        const rm = el('button', 'saved-item-remove');
        rm.setAttribute('aria-label', t('removedSaved'));
        const x = el('i'); x.setAttribute('data-lucide', 'x'); x.setAttribute('aria-hidden', 'true');
        rm.append(x);
        rm.addEventListener('click', (e) => { e.stopPropagation(); toggleSave(id); });
        item.append(thumb(it, 140, 70), txt, rm);
        item.addEventListener('click', () => { closeModal(savedDrawer); openDossier(id); });
        list.append(item);
    });
    refreshIcons();
}

/* ---- Recently viewed ---- */
const recentSection = document.getElementById('recent');
const getRecent = () => store.get('lr-recent', []);
function addRecent(id) {
    let r = getRecent().filter((x) => x !== id);
    r.unshift(id);
    store.set('lr-recent', r.slice(0, 6));
    renderRecent();
}
function renderRecent() {
    const row = document.getElementById('recent-row');
    if (!row || !recentSection) return;
    const r = getRecent();
    recentSection.hidden = !r.length;
    row.replaceChildren();
    r.forEach((id) => {
        const it = instruments[id];
        if (!it) return;
        const card = el('div', 'recent-card');
        card.dataset.id = id;
        card.append(thumb(it, 400, 75), el('h4', null, pickField(it, 'title')), el('span', null, pickField(it, 'kicker')));
        card.addEventListener('click', () => openDossier(id));
        row.append(card);
    });
}

/* ---- Lightbox ---- */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCap = document.getElementById('lightbox-caption');
const lbCounter = document.getElementById('lightbox-counter');
let lbList = [], lbIndex = 0, lbTitle = '';
function lbRender() {
    const src = lbList[lbIndex];
    if (!src) return;
    lbImg.src = src.indexOf('?') > -1 ? src : src + '?w=1600&q=85';
    lbImg.alt = lbTitle;
    if (lbCap) lbCap.textContent = lbTitle;
    if (lbCounter) lbCounter.textContent = (lbIndex + 1) + ' / ' + lbList.length;
}
function openLightbox(list, title, idx) {
    lbList = list || []; lbTitle = title || ''; lbIndex = idx || 0;
    lbRender();
    openModal(lightbox);
}
function lbStep(dir) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    lbRender();
}

/* ---- Dossier ---- */
const dossier = document.getElementById('dossier');
const dossierHero = document.getElementById('dossier-hero');
let currentDossierId = null;
function syncDossierSave() {
    const btn = document.getElementById('dossier-save');
    if (!btn || !currentDossierId) return;
    const saved = isSaved(currentDossierId);
    btn.classList.toggle('is-saved', saved);
    const txt = btn.querySelector('.btn-text');
    if (txt) txt.textContent = saved ? t('savedBtn') : t('save');
}
function fillDossier(id) {
    const it = instruments[id];
    document.getElementById('dossier-kicker').textContent = pickField(it, 'kicker') || '';
    document.getElementById('dossier-title').textContent = pickField(it, 'title') || '';
    document.getElementById('dossier-price').innerHTML = priceToCurrency(pickField(it, 'price') || '');
    document.getElementById('dossier-summary').textContent = pickField(it, 'summary') || '';
    document.getElementById('dossier-provenance').textContent = pickField(it, 'provenance') || '';
    const specs = document.getElementById('dossier-specs');
    specs.replaceChildren();
    (pickField(it, 'specs') || []).forEach((s) => {
        const d = el('div', 'spec');
        d.append(el('dt', null, s.label), el('dd', null, s.value));
        specs.append(d);
    });
}
function openDossier(id, instant) {
    const it = instruments[id];
    if (!it || !dossier) return;
    currentDossierId = id;
    fillDossier(id);
    const thumbs = document.getElementById('dossier-thumbs');
    const gal = it.gallery || [];
    const setHero = (i) => {
        dossierHero.src = gal[i] + '?w=1100&q=85';
        dossierHero.alt = pickField(it, 'title');
        thumbs.querySelectorAll('img').forEach((th, j) => th.classList.toggle('active', j === i));
    };
    thumbs.replaceChildren();
    gal.forEach((g, i) => {
        const im = el('img');
        im.src = g + '?w=200&q=70'; im.alt = ''; im.dataset.i = i;
        im.addEventListener('click', () => setHero(i));
        thumbs.append(im);
    });
    if (gal.length) setHero(0);
    dossierHero.onclick = () => {
        const active = Array.from(thumbs.querySelectorAll('img')).findIndex((th) => th.classList.contains('active'));
        openLightbox(gal, pickField(it, 'title'), active < 0 ? 0 : active);
    };
    syncDossierSave();
    if (instant) dossier.classList.add('no-fade');
    openModal(dossier);
    addRecent(id);
}
/** Open the dossier with a View Transition that morphs the card image into the hero. */
function openDossierFrom(id, sourceImg) {
    const canVT = typeof document.startViewTransition === 'function' && !isLite && !reducedMotion && sourceImg;
    if (!canVT) { openDossier(id); return; }
    sourceImg.style.viewTransitionName = 'piece-hero';
    const vt = document.startViewTransition(() => {
        sourceImg.style.viewTransitionName = '';
        openDossier(id, true);
        dossierHero.style.viewTransitionName = 'piece-hero';
        // let the hero image decode so the "new" snapshot is not blank (capped)
        return Promise.race([
            dossierHero.decode ? dossierHero.decode().catch(() => {}) : Promise.resolve(),
            new Promise((r) => setTimeout(r, 700)),
        ]);
    });
    vt.finished.finally(() => { dossierHero.style.viewTransitionName = ''; });
}

/* ---- Search ---- */
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
function runSearch(q) {
    if (!searchResults) return;
    q = (q || '').trim().toLowerCase();
    const ids = Object.keys(instruments);
    const hay = (it) => [pickField(it, 'title'), pickField(it, 'kicker'), pickField(it, 'summary'), it.title, it.kicker, it.summary].join(' ').toLowerCase();
    const matches = !q ? ids : ids.filter((id) => hay(instruments[id]).indexOf(q) > -1);
    searchResults.replaceChildren();
    if (!matches.length) {
        searchResults.append(el('p', 'search-empty', t('noMatch') + ' “' + q + '”.'));
        return;
    }
    matches.forEach((id) => {
        const it = instruments[id];
        const r = el('div', 'search-result');
        r.dataset.id = id;
        const txt = el('div');
        txt.append(el('div', 'sr-title', pickField(it, 'title')), el('div', 'sr-kicker', pickField(it, 'kicker')));
        r.append(thumb(it, 120, 70), txt);
        r.addEventListener('click', () => { closeModal(searchOverlay); openDossier(id); });
        searchResults.append(r);
    });
}
export function openSearch() {
    openModal(searchOverlay);
    runSearch('');
    setTimeout(() => searchInput && searchInput.focus(), 350);
}
export function openSavedDrawer() { openModal(savedDrawer); }

export function init() {
    applyCurrency(activeCurrency);

    filterBtns.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
    // Footer links carry data-filter → scroll (delegated elsewhere) + apply the filter
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-filter]');
        if (a) applyFilter(a.dataset.filter);
    });
    const catalogue = document.getElementById('catalogue-open');
    if (catalogue) catalogue.addEventListener('click', openSearch);

    cards.forEach((card) => {
        const fav = card.querySelector('.piece-favorite');
        if (fav) fav.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (card.dataset.id) toggleSave(card.dataset.id);
        });
        const img = card.querySelector('.piece-image');
        if (img) img.addEventListener('click', (e) => {
            if (e.target.closest('.piece-favorite')) return;
            if (card.dataset.id) openDossierFrom(card.dataset.id, img.querySelector('img'));
        });
    });

    const on = (id, ev, fn) => { const n = document.getElementById(id); if (n) n.addEventListener(ev, fn); };
    on('saved-open', 'click', () => openModal(savedDrawer));
    on('saved-close', 'click', () => closeModal(savedDrawer));
    on('recent-clear', 'click', () => { store.set('lr-recent', []); renderRecent(); toast(t('clearedRecent')); });
    on('lightbox-close', 'click', () => closeModal(lightbox));
    on('lightbox-prev', 'click', () => lbStep(-1));
    on('lightbox-next', 'click', () => lbStep(1));
    document.addEventListener('keydown', (e) => {
        if (!isModalOpen(lightbox)) return;
        if (e.key === 'ArrowLeft') lbStep(-1);
        if (e.key === 'ArrowRight') lbStep(1);
    });
    on('dossier-close', 'click', () => closeModal(dossier));
    on('dossier-enquire', 'click', () => closeModal(dossier));
    on('dossier-save', 'click', () => { if (currentDossierId) toggleSave(currentDossierId); });
    on('search-open', 'click', openSearch);
    on('search-close', 'click', () => closeModal(searchOverlay));
    if (searchInput) searchInput.addEventListener('input', () => runSearch(searchInput.value));

    // Language change: prices were re-rendered by i18n, dossier/saved/recent hold data-driven text
    document.addEventListener('lr:lang', () => {
        applyCurrency(activeCurrency);
        renderSaved();
        renderRecent();
        if (currentDossierId && isModalOpen(dossier)) { fillDossier(currentDossierId); syncDossierSave(); }
        if (isModalOpen(searchOverlay)) runSearch(searchInput ? searchInput.value : '');
    });

    syncSavedUI();
    renderRecent();
    void currentLang;
}
