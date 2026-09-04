/* theme.js — light / dark, remembered in localStorage['lr-theme'] (applied pre-paint by the head script). */
import { isLite, store } from './env.js';

let flashStyleAdded = false;

export function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('lr-theme', theme); } catch (e) { /* ignore */ }
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
    void store;
}
