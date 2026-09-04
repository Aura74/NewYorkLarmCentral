/* i18n.js — key-based translation engine.
   English is the source and lives in the markup. Elements declare
     data-i18n="key"              → textContent
     data-i18n-html="key"         → innerHTML (titles with <em>, prices with <span data-eur>)
     data-i18n-aria="key"         → aria-label
     data-i18n-placeholder="key"  → placeholder
   Swedish comes from DATA.i18n.sv.keyed; a missing key falls back to English.
   JS-side strings use t(key): DATA.i18n.sv.ui → UI_EN. */
import { DATA } from '../data.js';
import { store, emit, $$ } from './env.js';

const ATTRS = [
    ['data-i18n', (el) => el.textContent, (el, v) => { el.textContent = v; }],
    ['data-i18n-html', (el) => el.innerHTML, (el, v) => { el.innerHTML = v; }],
    ['data-i18n-aria', (el) => el.getAttribute('aria-label'), (el, v) => el.setAttribute('aria-label', v)],
    ['data-i18n-placeholder', (el) => el.getAttribute('placeholder'), (el, v) => el.setAttribute('placeholder', v)],
];

const EN = {};       // key → English, captured from the DOM on first run
const UI_EN = {
    sending: 'Sending…', received: 'Request Received!',
    formSent: 'Thank you — your request has been received. We will confirm your audition within the day.',
    formError: 'Something went wrong while sending. Please try again, or call +46 (0)8 555 0190.',
    errRequired: 'This field is required.', errName: 'Please enter at least two characters.',
    errEmail: 'Please enter a valid email address.', errMessage: 'Tell us a little about your project (at least 10 characters).',
    errInterest: 'Please choose what you are interested in.',
    saved: 'Saved — ', removedSaved: 'Removed from saved', clearedRecent: 'Cleared recently viewed',
    noMatch: 'No pieces match', instrument: 'instrument',
    save: 'Save', savedBtn: 'Saved',
    chooseTime: 'Now choose a time.', requested: '✓ Private audition requested for', at: 'at',
    openUntil: 'The atelier is open until', opensAt: 'The atelier opens at', weather: 'Local weather',
    tabAway: 'Until you return — Lars Résonance',
    perfHeavy: 'This page feels heavy on your device. Switch to a lighter version for a smoother experience?',
    perfSwitch: 'Switch to', perfNo: 'No thanks',
    'tier.lite': 'Lite', 'tier.standard': 'Standard', 'tier.premium': 'Premium',
};

export const currentLang = () => (document.documentElement.getAttribute('lang') === 'sv' ? 'sv' : 'en');
export const locale = () => (currentLang() === 'sv' ? 'sv-SE' : 'en-GB');

function pack(lang) { return (DATA.i18n || {})[lang] || {}; }

/** Translate a JS-side string (or any key) for the current language. */
export function t(key) {
    const p = pack(currentLang());
    return (p.ui && p.ui[key]) || (p.keyed && p.keyed[key]) || UI_EN[key] || EN[key] || key;
}

/** Pick a localised field from a data object: obj.sv.field when Swedish and present, else obj.field. */
export function pickField(obj, field) {
    const lang = currentLang();
    if (lang !== 'en' && obj && obj[lang] && obj[lang][field] != null) return obj[lang][field];
    return obj ? obj[field] : undefined;
}

function capture() {
    ATTRS.forEach(([attr, get]) => {
        $$(`[${attr}]`).forEach((el) => {
            const key = el.getAttribute(attr);
            if (EN[key] == null) EN[key] = get(el);
        });
    });
}

export function applyLang(lang) {
    capture(); // picks up anything added since last run
    const keyed = pack(lang).keyed || {};
    ATTRS.forEach(([attr, , set]) => {
        $$(`[${attr}]`).forEach((el) => {
            const key = el.getAttribute(attr);
            const v = lang === 'en' ? EN[key] : (keyed[key] != null ? keyed[key] : EN[key]);
            if (v != null) set(el, v);
        });
    });
    document.documentElement.setAttribute('lang', lang);
    store.set('lr-lang', lang);
    emit('lr:lang', { lang });
}

export function init() {
    const lang = store.get('lr-lang', 'en');
    capture();
    if (lang !== 'en') applyLang(lang);
    else emit('lr:lang', { lang });
}
