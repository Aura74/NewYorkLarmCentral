/* env.js — effects tier, feature detection and tiny shared helpers.
   The tier itself is decided before first paint by the inline script in <head>. */
export const TIERS = ['lite', 'standard', 'premium'];
const attr = document.documentElement.dataset.perf;
export const perfMode = TIERS.includes(attr) ? attr : 'standard';
export const isLite = perfMode === 'lite';
export const isPremium = perfMode === 'premium';
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
export const hasGsap = !!(window.gsap && window.ScrollTrigger);
/* scroll reveals, counters, hero entrance */
export const motion = hasGsap && !isLite;
/* CSS scroll-driven animations (progress bar, stats parallax) — JS skips its own version */
export const cssScrollTimeline = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'));

if (!hasGsap) document.documentElement.classList.add('no-motion');

export function setPerf(level) {
    if (!TIERS.includes(level) || level === perfMode) return;
    try { localStorage.setItem('lr-perf', level); } catch (e) { /* private mode */ }
    // JS-side effects are wired at load, so reload — without any ?perf= override in the URL.
    const url = new URL(location.href);
    url.searchParams.delete('perf');
    location.replace(url.href);
}

export const store = {
    get(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
};

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
export const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };
