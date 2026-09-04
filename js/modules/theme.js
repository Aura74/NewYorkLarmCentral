/* theme.js — light / dark, remembered in localStorage['lr-theme'] (applied pre-paint by the head script). */
import { isLite, store } from './env.js';

let flashStyleAdded = false;

const OPEN = 9, CLOSE = 18; // the atelier's hours; 'auto' is dark outside them

export function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
/** The stored preference: 'auto' | 'light' | 'dark' */
export function themeChoice() {
    const v = store.raw('lr-theme');
    return v === 'light' || v === 'dark' ? v : 'auto';
}
function autoIsDark() {
    try {
        const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: 'numeric', hour12: false }).format(new Date()));
        return h < OPEN || h >= CLOSE;
    } catch (e) { return false; }
}

export function setTheme(choice) {
    const theme = choice === 'auto' ? (autoIsDark() ? 'dark' : 'light') : choice;
    if (theme === currentTheme()) {
        try { localStorage.setItem('lr-theme', choice); } catch (e) { /* ignore */ }
        return;
    }
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('lr-theme', choice); } catch (e) { /* ignore */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0D0D0D' : '#0A1628');
    if (isLite) return;
    if (!flashStyleAdded) {
        const st = document.createElement('style');
        st.textContent = '@keyframes themeFlash{0%{opacity:1}100%{opacity:0}}';
        document.head.appendChild(st);
        flashStyleAdded = true;
    }
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;' +
        'background:' + (theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)') + ';' +
        'animation:themeFlash 0.6s ease forwards;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

export function init() {
    // Keep the meta colour in sync with whatever the head script applied
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#0D0D0D' : '#0A1628');
    // In 'auto', re-evaluate every ten minutes so a long visit follows the clock
    setInterval(() => { if (themeChoice() === 'auto') setTheme('auto'); }, 10 * 60 * 1000);
}
