/* settings.js — gear dropdown, mobile menu, segmented controls (language / currency / theme / effects). */
import { perfMode, setPerf, store, $$ } from './env.js';
import { applyLang } from './i18n.js';
import { setTheme, themeChoice } from './theme.js';
import { applyCurrency, getCurrency, openSearch, openSavedDrawer } from './collection.js';

function syncSegs(ctl, val) {
    $$(`.seg[data-ctl="${ctl}"] button`).forEach((b) => b.classList.toggle('active', b.dataset.val === val));
}

export function init() {
    // Gear dropdown (desktop)
    const settingsOpen = document.getElementById('settings-open');
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsOpen && settingsPanel) {
        const close = () => {
            settingsPanel.classList.remove('open');
            settingsOpen.classList.remove('open');
            settingsOpen.setAttribute('aria-expanded', 'false');
        };
        settingsOpen.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = settingsPanel.classList.toggle('open');
            settingsOpen.classList.toggle('open', open);
            settingsOpen.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', (e) => {
            if (settingsPanel.classList.contains('open') && !settingsPanel.contains(e.target) && !settingsOpen.contains(e.target)) close();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    // Mobile menu
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobile = () => {
        if (navToggle) navToggle.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        $$('.mobile-link').forEach((link) => link.addEventListener('click', closeMobile));
    }
    const sOpenM = document.getElementById('search-open-m');
    if (sOpenM) sOpenM.addEventListener('click', () => { closeMobile(); openSearch(); });
    const savOpenM = document.getElementById('saved-open-m');
    if (savOpenM) savOpenM.addEventListener('click', () => { closeMobile(); openSavedDrawer(); });

    // Segmented controls
    syncSegs('lang', store.get('lr-lang', 'en'));
    syncSegs('currency', getCurrency());
    syncSegs('theme', themeChoice());
    syncSegs('effects', perfMode);
    $$('.seg').forEach((seg) => {
        const ctl = seg.dataset.ctl;
        seg.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                if (ctl === 'currency') { applyCurrency(val); syncSegs('currency', val); }
                else if (ctl === 'theme') { setTheme(val); syncSegs('theme', val); }
                else if (ctl === 'lang') { applyLang(val); syncSegs('lang', val); }
                else if (ctl === 'effects') setPerf(val);
            });
        });
    });
}
