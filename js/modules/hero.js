/* hero.js — preloader (Premium), hero entrance, slideshow with lazy slides, "Play a note". */
import { isLite, isPremium, motion } from './env.js';

let heroStarted = false;

function initHeroAnimations() {
    if (!motion) return;
    const tl = window.gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 1, delay: 0.2 })
        .to('.title-word', { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }, '-=0.6')
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1 }, '-=0.6')
        .to('.hero-actions', { opacity: 1, y: 0, duration: 1 }, '-=0.6');
}

function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    initHeroAnimations();
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloader-progress');
    const pct = document.getElementById('preloader-percent');
    if (isPremium && preloader && bar) {
        const t0 = performance.now();
        const MIN = 500, MAX = 1400;
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            bar.style.width = '100%';
            if (pct) pct.textContent = '100%';
            setTimeout(() => { preloader.classList.add('hidden'); startHero(); }, 300);
        };
        const tick = () => {
            if (done) return;
            const p = Math.min(92, ((performance.now() - t0) / MAX) * 100);
            bar.style.width = p + '%';
            if (pct) pct.textContent = Math.floor(p) + '%';
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        window.addEventListener('load', () => setTimeout(finish, Math.max(0, MIN - (performance.now() - t0))));
        setTimeout(finish, MAX);
    } else {
        if (preloader) preloader.classList.add('hidden');
        startHero();
    }
}

function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    const counter = document.querySelector('.current-slide');
    let current = 0;
    const loadBg = (slide) => {
        if (slide.dataset.bg) {
            slide.style.backgroundImage = 'url("' + slide.dataset.bg + '")';
            delete slide.dataset.bg;
        }
    };
    const next = () => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        loadBg(slides[current]);
        slides[current].classList.add('active');
        if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    };
    if (!isLite && slides.length > 1) {
        window.addEventListener('load', () => setTimeout(() => slides.forEach(loadBg), 1500));
        setInterval(next, 6000);
    }
}

function initListen() {
    const btn = document.getElementById('hero-listen');
    if (!btn) return;
    let ctx = null;
    let playing = false;
    const notes = [261.63, 329.63, 392.00, 493.88, 587.33, 783.99]; // C major 9 arpeggio
    const playNote = (freq, start, dur) => {
        const t = ctx.currentTime + start;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, t);
        master.gain.linearRampToValueAtTime(0.22, t + 0.012);
        master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        master.connect(ctx.destination);
        [[1, 1], [2, 0.4], [3, 0.18], [4, 0.08]].forEach(([mult, amp]) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq * mult;
            const g = ctx.createGain();
            g.gain.value = amp;
            osc.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + dur);
        });
    };
    btn.addEventListener('click', () => {
        if (playing) return;
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        playing = true;
        btn.classList.add('playing');
        const step = 0.26;
        notes.forEach((f, i) => playNote(f, i * step, 1.8));
        setTimeout(() => { playing = false; btn.classList.remove('playing'); }, (notes.length * step + 1.8) * 1000);
    });
}

export function init() {
    initPreloader();
    initSlideshow();
    initListen();
}
