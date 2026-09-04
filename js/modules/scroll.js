/* scroll.js — one passive scroll listener, batched into a single rAF, with cached
   layout metrics. Also: Lenis smooth scroll (Premium) and delegated anchor scrolling. */
import { isLite, isPremium, hasGsap, cssScrollTimeline } from './env.js';

const tasks = [];
let scheduled = false;
let lenis = null;

export const getLenis = () => lenis;

function run() {
    scheduled = false;
    const y = window.scrollY;
    for (let i = 0; i < tasks.length; i++) tasks[i](y);
}

/** Register a scroll task; called once immediately. */
export function onScroll(fn) { tasks.push(fn); fn(window.scrollY); }

export const metrics = { maxScroll: 1, sectionTops: [], heroBottom: 600 };
const sections = document.querySelectorAll('section[id]');

export function measure() {
    metrics.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const hero = document.getElementById('hero');
    if (hero) metrics.heroBottom = hero.offsetHeight;
    metrics.sectionTops = Array.from(sections).map((sec) => ({
        id: sec.id, top: sec.getBoundingClientRect().top + window.scrollY - 200,
    }));
}

export function scrollToTarget(target) {
    const offset = 80;
    if (lenis) {
        lenis.scrollTo(target, { offset: target === 0 ? 0 : -offset });
    } else {
        const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: isLite ? 'auto' : 'smooth' });
    }
}

export function init() {
    window.addEventListener('scroll', () => {
        if (!scheduled) { scheduled = true; requestAnimationFrame(run); }
    }, { passive: true });

    measure();
    window.addEventListener('load', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
    else window.addEventListener('resize', measure);

    // Lenis smooth scroll — Premium only, driven by the GSAP ticker
    if (isPremium && hasGsap && window.Lenis) {
        lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => lenis.raf(time * 1000));
        window.gsap.ticker.lagSmoothing(0);
    }
    if (hasGsap) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.addEventListener('load', () => window.ScrollTrigger.refresh());
    }

    // Header: hysteresis (on above 80, off below 30) so it never flickers at the threshold
    const header = document.getElementById('header');
    if (header) onScroll((y) => {
        if (y > 80) header.classList.add('scrolled');
        else if (y < 30) header.classList.remove('scrolled');
    });

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        onScroll((y) => backToTop.classList.toggle('visible', y > 600));
        backToTop.addEventListener('click', () => scrollToTarget(0));
    }

    // Active nav link from the cached section offsets
    const navLinks = document.querySelectorAll('.nav-link');
    let active = '';
    onScroll((y) => {
        let current = '';
        const tops = metrics.sectionTops;
        for (let i = 0; i < tops.length; i++) if (y >= tops[i].top) current = tops[i].id;
        if (current === active) return;
        active = current;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
    });

    // Progress bar: CSS scroll-driven animation when supported, else JS
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar && !isLite && !cssScrollTimeline) {
        onScroll((y) => { progressBar.style.transform = 'scaleX(' + Math.min(1, y / metrics.maxScroll) + ')'; });
    }

    const bookBar = document.getElementById('mobile-book-bar');
    if (bookBar) onScroll((y) => bookBar.classList.toggle('visible', y > metrics.heroBottom - 120));

    const announceBar = document.getElementById('announce');
    if (announceBar) onScroll((y) => announceBar.classList.toggle('hidden', y > 80));

    // Delegated anchor scrolling (covers links added later, e.g. by the chat)
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        e.preventDefault();
        if (href === '#' || href === '#hero') { scrollToTarget(0); return; }
        let target = null;
        try { target = document.querySelector(href); } catch (err) { target = null; }
        if (target) scrollToTarget(target);
    });
}
