/* motion.js — cursor ring, magnetic buttons, scroll reveals, counters, parallax.
   Everything here is a no-op in Lite (CSS keeps content visible). */
import { isPremium, finePointer, hasGsap, motion, cssScrollTimeline } from './env.js';
import { locale } from './i18n.js';

export function revealOnScroll(selector, fromProps, staggerDelay) {
    if (!motion) return;
    const { gsap, ScrollTrigger } = window;
    gsap.utils.toArray(selector).forEach((el, index) => {
        gsap.set(el, fromProps);
        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () => gsap.to(el, {
                opacity: 1, x: 0, y: 0, clipPath: 'none', duration: 0.9,
                delay: staggerDelay ? index * staggerDelay : 0, ease: 'expo.out',
            }),
        });
    });
}

function initCursor() {
    const ring = document.getElementById('cursor-follower');
    if (!(isPremium && finePointer && ring)) return;
    let mx = 0, my = 0, fx = 0, fy = 0, raf = null;
    const step = () => {
        fx += (mx - fx) * 0.12;
        fy += (my - fy) * 0.12;
        ring.style.transform = 'translate3d(' + fx + 'px,' + fy + 'px,0)';
        raf = (Math.abs(mx - fx) + Math.abs(my - fy) > 0.3) ? requestAnimationFrame(step) : null;
    };
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (raf === null) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.querySelectorAll('a, button, .piece-card, .service-card, input, textarea, select').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });
}

function initMagnetic() {
    if (!(isPremium && finePointer)) return;
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        btn.addEventListener('mouseenter', () => { btn.style.transition = 'none'; });
    });
}

function initCounters() {
    document.querySelectorAll('[data-count]').forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const isFloat = target % 1 !== 0;
        const fmt = (v) => (isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString(locale()));
        if (!motion) { counter.textContent = fmt(target); return; }
        window.ScrollTrigger.create({
            trigger: counter, start: 'top 85%', once: true,
            onEnter: () => window.gsap.to(counter, {
                duration: 2.8, ease: 'power2.out',
                onUpdate: function () { counter.textContent = fmt(target * this.progress()); },
            }),
        });
    });
}

export function init() {
    initCursor();
    initMagnetic();

    revealOnScroll('.section-tag', { opacity: 0, x: -30 });
    revealOnScroll('.section-title', { opacity: 0, y: 40 });
    revealOnScroll('.section-desc', { opacity: 0, y: 30 });
    revealOnScroll('.about-content', { opacity: 0, x: 40 });
    revealOnScroll('.about-feature', { opacity: 0, y: 30 }, 0.15);
    revealOnScroll('.stat-item', { opacity: 0, y: 40 }, 0.15);
    revealOnScroll('.luxury-cta-content', { opacity: 0, y: 60 });
    revealOnScroll('.contact-info', { opacity: 0, x: -40 });
    revealOnScroll('.contact-form-wrapper', { opacity: 0, x: 40 });
    revealOnScroll('.contact-item', { opacity: 0, x: -20 }, 0.12);
    revealOnScroll('.footer-top > *', { opacity: 0, y: 30 }, 0.1);

    if (motion) {
        const { gsap, ScrollTrigger } = window;
        gsap.utils.toArray('.img-reveal').forEach((img) => {
            gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });
            ScrollTrigger.create({
                trigger: img, start: 'top 85%', once: true,
                onEnter: () => gsap.to(img, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.inOut' }),
            });
        });
        document.querySelectorAll('.service-card').forEach((card, index) => {
            gsap.set(card, { opacity: 0, y: 50 });
            ScrollTrigger.create({
                trigger: card, start: 'top 90%', once: true,
                onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.8, delay: index * 0.12, ease: 'expo.out' }),
            });
        });
        document.querySelectorAll('.piece-card').forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card, start: 'top 85%', once: true,
                onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.8, delay: (index % 3) * 0.15, ease: 'expo.out' }),
            });
        });
    }

    initCounters();

    // Stats parallax: CSS scroll-driven when supported, GSAP scrub otherwise (Premium only)
    if (isPremium && hasGsap && !cssScrollTimeline) {
        window.gsap.to('.stats-bg', {
            scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: 1 },
            y: -35, ease: 'none',
        });
    }
}
