/* certificate.js — renders the instrument certificate for ?id=<instrument> from data.js.
   "Save as PDF" is the browser's print dialog, styled by the page's print CSS. */
import { DATA } from './data.js';

const lang = (() => { try { return localStorage.getItem('lr-lang') === '"sv"' || localStorage.getItem('lr-lang') === 'sv' ? 'sv' : 'en'; } catch (e) { return 'en'; } })();
const locale = lang === 'sv' ? 'sv-SE' : 'en-GB';
const T = {
    en: { back: '← Back to the atelier', print: 'Save as PDF / Print', kicker: 'Certificate of Provenance', lede: 'This certifies that the instrument described below was selected, prepared and voiced by the technicians of Lars Résonance Atelier, Stockholm, and left the atelier in concert condition.',
          serial: 'Serial number', origin: 'Origin', tuned: 'Last tuning / calibration', cert: 'Certificate no.', issued: 'Issued', specs: 'Specification', tech: 'Head Technician', atelier: 'For the atelier', seal: 'Atelier · Stockholm', empty: 'No instrument found for this certificate.' },
    sv: { back: '← Tillbaka till ateljén', print: 'Spara som PDF / Skriv ut', kicker: 'Proveniensintyg', lede: 'Härmed intygas att instrumentet nedan har valts ut, förberetts och intonerats av teknikerna vid Lars Résonance Atelier, Stockholm, och lämnat ateljén i konsertskick.',
          serial: 'Serienummer', origin: 'Ursprung', tuned: 'Senast stämd / kalibrerad', cert: 'Certifikat nr', issued: 'Utfärdat', specs: 'Specifikation', tech: 'Chefstekniker', atelier: 'För ateljén', seal: 'Ateljé · Stockholm', empty: 'Inget instrument hittades för detta certifikat.' },
}[lang];
document.documentElement.lang = lang;

const pick = (o, f) => (lang !== 'en' && o && o.sv && o.sv[f] != null ? o.sv[f] : o ? o[f] : undefined);
const fmt = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

document.getElementById('back').textContent = T.back;
const printBtn = document.getElementById('print');
printBtn.textContent = T.print;
printBtn.addEventListener('click', () => window.print());

const id = new URLSearchParams(location.search).get('id');
const it = (DATA.instruments || {})[id];
const sheet = document.getElementById('sheet');
if (!it || !it.record) {
    const e = document.getElementById('empty'); e.textContent = T.empty; e.hidden = false;
} else {
    document.getElementById('empty').remove();
    const rec = it.record;
    document.title = `${T.kicker} — ${it.title}`;
    const mark = el('div', 'mark'); mark.append(el('span', null, 'LARS'), el('span', null, '|'), el('span', null, 'RÉSONANCE'), el('small', null, 'ATELIER'));
    sheet.append(mark, el('p', 'kicker', T.kicker), el('h1', null, pick(it, 'title')), el('p', 'lede', T.lede));
    const dl = el('dl');
    [[T.serial, rec.serial], [T.origin, rec.origin], [T.tuned, fmt(rec.lastTuning)], [T.cert, rec.certificate]].forEach(([k, v]) => { dl.append(el('dt', null, k), el('dd', null, v)); });
    sheet.append(dl);
    const specs = el('dl', 'specs');
    (pick(it, 'specs') || []).forEach((s) => { const row = el('div'); row.append(el('dt', null, s.label), el('dd', null, s.value)); specs.append(row); });
    sheet.append(specs, el('p', 'prov', pick(it, 'provenance')));
    const sign = el('div', 'sign');
    const a = el('div'); a.append(el('strong', null, 'Henrik Åkerlund'), document.createTextNode(T.tech));
    const b = el('div'); b.append(el('strong', null, 'Lars Résonance'), document.createTextNode(T.atelier + ' · ' + T.issued + ' ' + fmt(new Date().toISOString().slice(0, 10))));
    sign.append(a, b);
    sheet.append(sign, el('div', 'seal', T.seal));
}
