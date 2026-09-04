/* ============================================================
   LARS RÉSONANCE — application entry (ES modules, no build step)
   Order matters: env decides the tier, i18n runs before anything renders
   text, scroll/ui provide services the feature modules import.
   ============================================================ */
import { refreshIcons } from './modules/env.js';
import * as i18n from './modules/i18n.js';
import * as theme from './modules/theme.js';
import * as scroll from './modules/scroll.js';
import * as ui from './modules/ui.js';
import * as hero from './modules/hero.js';
import * as motion from './modules/motion.js';
import * as collection from './modules/collection.js';
import * as sliders from './modules/sliders.js';
import * as booking from './modules/booking.js';
import * as form from './modules/form.js';
import * as ambient from './modules/ambient.js';
import * as settings from './modules/settings.js';
import * as perfProbe from './modules/perf-probe.js';
import * as chat from './modules/chat.js';
import * as content from './modules/content.js';

refreshIcons();

[i18n, theme, scroll, ui, hero, motion, collection, sliders, booking, form, ambient, settings, perfProbe, chat]
    .forEach((mod) => {
        try { mod.init(); } catch (err) { console.error('[Résonance] module failed:', err); }
    });
try { content.init({ openDossier: collection.openDossier }); } catch (err) { console.error('[Résonance] content failed:', err); }

window.__lrApp = true;

// Offline / repeat-visit cache. Only over http(s); bump CACHE_VERSION in sw.js on each release.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW registration failed:', err));
    });
}

console.log('%c LARS RÉSONANCE ', 'background: #0A1628; color: #C9A96E; font-size: 14px; padding: 10px 20px; font-family: Georgia;');
