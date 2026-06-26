/* ============================================================
   LARS RÉSONANCE - Premium Interactive Experience
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // ---- Performance / Effects Tier ----
    // Auto-detect device capability, allow the visitor to override and remember it.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    const mem = navigator.deviceMemory || 8;
    const autoMode = (reducedMotion || cores <= 4 || mem <= 4) ? 'lite' : 'full';
    const perfMode = localStorage.getItem('lr-perf') || autoMode;
    const isFull = perfMode === 'full';
    document.documentElement.setAttribute('data-perf', perfMode);
    // (Effects mode is controlled from the settings menu seg, wired in Phase 3.)

    // ---- Theme (applied on load; controlled from the settings menu seg) ----
    const savedTheme = localStorage.getItem('nylc-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    function setTheme(theme) {
        if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('nylc-theme', theme);
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;' +
            'background:' + (theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)') + ';' +
            'animation:themeFlash 0.6s ease forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 700);
    }
    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
    const flashStyle = document.createElement('style');
    flashStyle.textContent = '@keyframes themeFlash{0%{opacity:1}100%{opacity:0}}';
    document.head.appendChild(flashStyle);

    // ---- Preloader ----
    const preloader = document.getElementById('preloader');
    const preloaderProgress = document.getElementById('preloader-progress');
    const preloaderPercent = document.getElementById('preloader-percent');
    let loadProgress = 0;

    const preloaderInterval = setInterval(() => {
        loadProgress += Math.random() * 15;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(preloaderInterval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                initHeroAnimations();
            }, 400);
        }
        preloaderProgress.style.width = loadProgress + '%';
        preloaderPercent.textContent = Math.floor(loadProgress) + '%';
    }, 100);

    // ---- Custom Cursor ----
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follower animation
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .property-card, .service-card, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorFollower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorFollower.classList.remove('active');
        });
    });

    // ---- Magnetic Buttons ----
    const magneticBtns = isFull ? document.querySelectorAll('.magnetic-btn') : [];
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });

    // ---- Header Scroll ----
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = scrollY;

        // Back to top visibility
        const backToTop = document.getElementById('back-to-top');
        if (scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Back to top
    document.getElementById('back-to-top').addEventListener('click', () => {
        if (lenis) {
            lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ---- Mobile Menu ----
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ---- Active Nav Link on Scroll ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                if (lenis) {
                    lenis.scrollTo(target, { offset: -offset });
                } else {
                    const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });
                }
            }
        });
    });

    // ---- Hero Slide Show ----
    const heroSlides = document.querySelectorAll('.hero-slide');
    const currentSlideEl = document.querySelector('.current-slide');
    let currentSlide = 0;

    function nextHeroSlide() {
        heroSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % heroSlides.length;
        heroSlides[currentSlide].classList.add('active');
        if (currentSlideEl) {
            currentSlideEl.textContent = String(currentSlide + 1).padStart(2, '0');
        }
    }

    setInterval(nextHeroSlide, 6000);

    // ---- Hero Particles (removed for a calmer, more restrained feel) ----
    const particlesContainer = document.getElementById('hero-particles');
    for (let i = 0; false && i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 20) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (1 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }

    // ---- GSAP Animations ----
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ---- Lenis Smooth Scroll (full mode only) ----
    let lenis = null;
    if (isFull && window.Lenis) {
        lenis = new Lenis({
            lerp: 0.09,
            wheelMultiplier: 1,
            smoothWheel: true,
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // Hero entrance animation
    function initHeroAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        tl.to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.2
        })
        .to('.title-word', {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.15
        }, '-=0.6')
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.6')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.6');
    }

    // ---- Scroll-triggered reveals ----
    // Helper: safe scroll animation that guarantees visibility
    function revealOnScroll(selector, fromProps, staggerDelay) {
        gsap.utils.toArray(selector).forEach((el, index) => {
            gsap.set(el, fromProps);
            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(el, {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        clipPath: 'none',
                        duration: 0.9,
                        delay: staggerDelay ? index * staggerDelay : 0,
                        ease: 'expo.out'
                    });
                },
                once: true
            });
        });
    }

    // Section tags
    revealOnScroll('.section-tag', { opacity: 0, x: -30 });

    // Section titles
    revealOnScroll('.section-title', { opacity: 0, y: 40 });

    // Section descriptions
    revealOnScroll('.section-desc', { opacity: 0, y: 30 });

    // About images reveal
    gsap.utils.toArray('.img-reveal').forEach(img => {
        gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });
        ScrollTrigger.create({
            trigger: img,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(img, {
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 1.2,
                    ease: 'expo.inOut'
                });
            },
            once: true
        });
    });

    // About content
    revealOnScroll('.about-content', { opacity: 0, x: 40 });

    // About features
    revealOnScroll('.about-feature', { opacity: 0, y: 30 }, 0.15);

    // ---- Animated Counter ----
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const isFloat = target % 1 !== 0;

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(counter, {
                    duration: 2.8,
                    ease: 'power2.out',
                    onUpdate: function() {
                        const progress = this.progress();
                        const current = target * progress;
                        counter.textContent = isFloat
                            ? current.toFixed(1)
                            : Math.floor(current).toLocaleString();
                    }
                });
            },
            once: true
        });
    });

    // ---- Stats Animation ----
    revealOnScroll('.stat-item', { opacity: 0, y: 40 }, 0.15);

    // ---- Property Cards ----
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: index % 3 * 0.15,
                    ease: 'expo.out'
                });
            },
            once: true
        });
    });

    // Property card 3D tilt effect (disabled — calmer motion; cards use CSS hover only)
    [].forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const tiltX = (y - 0.5) * 6;
            const tiltY = (x - 0.5) * -6;

            card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // ---- Property Filters ----
    const propertyGrid = document.querySelector('.property-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // On mobile, "All Solutions" reveals the hidden cards 4-6
            if (filter === 'all') {
                propertyGrid.classList.add('show-all-mobile');
            } else {
                propertyGrid.classList.remove('show-all-mobile');
            }

            propertyCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category.includes(filter)) {
                    gsap.to(card, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        ease: 'expo.out',
                        display: 'block'
                    });
                } else {
                    gsap.to(card, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.3,
                        ease: 'expo.out',
                        onComplete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });

    // "View Full Product Catalog" reveals all cards on mobile too
    const viewCatalogBtn = document.querySelector('.properties-cta .btn');
    if (viewCatalogBtn) {
        viewCatalogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            propertyGrid.classList.add('show-all-mobile');
            filterBtns.forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');
            propertyCards.forEach(card => {
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: 'expo.out',
                    display: 'block'
                });
            });
        });
    }

    // ---- Service Cards ----
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        gsap.set(card, { opacity: 0, y: 50 });
        ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: index * 0.12,
                    ease: 'expo.out'
                });
            },
            once: true
        });
    });

    // ---- Neighborhood Swiper ----
    const neighborhoodSwiper = new Swiper('.neighborhood-swiper', {
        slidesPerView: 1.2,
        spaceBetween: 24,
        speed: 800,
        grabCursor: true,
        loop: true,
        loopAdditionalSlides: 2,
        pagination: {
            el: '.swiper-pagination-custom',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-btn-next',
            prevEl: '.swiper-btn-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 1.8,
                spaceBetween: 24,
            },
            1024: {
                slidesPerView: 2.5,
                spaceBetween: 32,
            },
            1400: {
                slidesPerView: 3.2,
                spaceBetween: 32,
            }
        }
    });

    // ---- Testimonial Swiper ----
    const testimonialSwiper = new Swiper('.testimonial-swiper', {
        slidesPerView: 1,
        spaceBetween: 32,
        speed: 600,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.testimonial-pagination',
            clickable: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1200: {
                slidesPerView: 3,
            }
        }
    });

    // ---- Luxury CTA Parallax ----
    revealOnScroll('.luxury-cta-content', { opacity: 0, y: 60 });

    // ---- Contact Section Animations ----
    revealOnScroll('.contact-info', { opacity: 0, x: -40 });
    revealOnScroll('.contact-form-wrapper', { opacity: 0, x: 40 });
    revealOnScroll('.contact-item', { opacity: 0, x: -20 }, 0.12);

    // ---- Contact Form ----
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Animated submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.querySelector('.btn-text').textContent;

        submitBtn.querySelector('.btn-text').textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate send
        setTimeout(() => {
            submitBtn.querySelector('.btn-text').textContent = 'Request Received!';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';

            setTimeout(() => {
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2500);
        }, 1500);
    });

    // ---- Favorite / wishlist hearts are wired in the Phase 2 block below ----

    // ---- Footer reveal ----
    revealOnScroll('.footer-top > *', { opacity: 0, y: 30 }, 0.1);

    // ---- Parallax on Stats Background (gentle, full mode only) ----
    if (isFull) {
        gsap.to('.stats-bg', {
            scrollTrigger: {
                trigger: '.stats',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -35,
            ease: 'none'
        });
    }

    // ---- Hero "Play a note" (Web Audio, no audio file) ----
    const listenBtn = document.getElementById('hero-listen');
    if (listenBtn) {
        let audioCtx = null;
        let playing = false;
        // A gentle C major 9 arpeggio
        const notes = [261.63, 329.63, 392.00, 493.88, 587.33, 783.99];

        function playNote(freq, start, dur) {
            const t = audioCtx.currentTime + start;
            const master = audioCtx.createGain();
            master.gain.setValueAtTime(0.0001, t);
            master.gain.linearRampToValueAtTime(0.22, t + 0.012);
            master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            master.connect(audioCtx.destination);
            // additive harmonics for a softer, piano-like timbre
            [[1, 1], [2, 0.4], [3, 0.18], [4, 0.08]].forEach(([mult, amp]) => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq * mult;
                const g = audioCtx.createGain();
                g.gain.value = amp;
                osc.connect(g);
                g.connect(master);
                osc.start(t);
                osc.stop(t + dur);
            });
        }

        listenBtn.addEventListener('click', () => {
            if (playing) return;
            if (!audioCtx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AC();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            playing = true;
            listenBtn.classList.add('playing');
            const step = 0.26;
            notes.forEach((f, i) => playNote(f, i * step, 1.8));
            const total = (notes.length * step + 1.8) * 1000;
            setTimeout(() => {
                playing = false;
                listenBtn.classList.remove('playing');
            }, total);
        });
    }

    /* ======================================================================
       PHASE 2 — dossier, gallery lightbox, currency, wishlist, recently
       viewed, search, toasts, focus-trap, intro, FPS, weather, video
       Each piece is null-guarded so one failure can't break the others.
       ====================================================================== */
    const DATA = window.RESONANCE_DATA || {};
    const instruments = DATA.instruments || {};

    const store = {
        get(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    };
    const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };

    // ---- Toasts ----
    const toastsEl = document.getElementById('toasts');
    function toast(msg, icon) {
        if (!toastsEl) return;
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = '<i data-lucide="' + (icon || 'check') + '"></i><span></span>';
        t.querySelector('span').textContent = msg;
        toastsEl.appendChild(t);
        refreshIcons();
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3200);
    }

    // ---- Modal scaffolding with focus trap ----
    let activeModal = null;
    let lastFocused = null;
    function trapKey(modal) {
        return (e) => {
            if (e.key !== 'Tab') return;
            const f = modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
            const list = Array.from(f).filter(el => el.offsetParent !== null);
            if (!list.length) return;
            const first = list[0], last = list[list.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
    }
    function openModal(modal) {
        if (!modal) return;
        lastFocused = document.activeElement;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
        activeModal = modal;
        modal._trap = trapKey(modal);
        modal.addEventListener('keydown', modal._trap);
        const focusables = modal.querySelectorAll('button,a[href],input,select');
        if (focusables.length) focusables[0].focus();
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        if (modal._trap) modal.removeEventListener('keydown', modal._trap);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        if (activeModal === modal) activeModal = null;
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) closeModal(activeModal);
    });

    // ---- Currency ----
    const currencies = DATA.currencies || {};
    let activeCurrency = store.get('lr-currency', DATA.baseCurrency || 'EUR');
    function formatMoney(eur, code) {
        const c = currencies[code] || currencies.EUR || { rate: 1, symbol: '€', position: 'before', locale: 'en-US' };
        const val = Math.round(eur * c.rate);
        const num = val.toLocaleString(c.locale || 'en-US');
        return c.position === 'after' ? (num + c.symbol) : (c.symbol + num);
    }
    function applyCurrency(code) {
        activeCurrency = code;
        store.set('lr-currency', code);
        document.querySelectorAll('[data-eur]').forEach(el => {
            el.textContent = formatMoney(Number(el.dataset.eur), code);
        });
    }
    function priceToCurrency(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        tmp.querySelectorAll('[data-eur]').forEach(el => {
            el.textContent = formatMoney(Number(el.dataset.eur), activeCurrency);
        });
        return tmp.innerHTML;
    }
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = activeCurrency;
        currencySelect.addEventListener('change', () => applyCurrency(currencySelect.value));
    }
    applyCurrency(activeCurrency);

    // ---- Wishlist ----
    const getSaved = () => store.get('lr-saved', []);
    const isSaved = (id) => getSaved().includes(id);
    function toggleSave(id) {
        let s = getSaved();
        if (s.includes(id)) { s = s.filter(x => x !== id); toast('Removed from saved', 'heart'); }
        else { s.push(id); toast('Saved — ' + ((instruments[id] || {}).title || 'instrument'), 'heart'); }
        store.set('lr-saved', s);
        syncSavedUI();
    }
    function syncSavedUI() {
        const s = getSaved();
        const count = document.getElementById('saved-count');
        if (count) { count.textContent = s.length; count.hidden = s.length === 0; }
        document.querySelectorAll('.property-card').forEach(card => {
            const fav = card.querySelector('.property-favorite');
            if (fav) fav.classList.toggle('favorited', s.includes(card.dataset.id));
        });
        if (typeof currentDossierId !== 'undefined' && currentDossierId) syncDossierSave();
        renderSaved();
    }
    document.querySelectorAll('.property-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.property-card');
            if (card && card.dataset.id) toggleSave(card.dataset.id);
        });
    });

    // ---- Saved drawer ----
    const savedDrawer = document.getElementById('saved-drawer');
    function renderSaved() {
        const list = document.getElementById('saved-list');
        const empty = document.getElementById('saved-empty');
        if (!list) return;
        const s = getSaved();
        if (empty) empty.hidden = s.length > 0;
        list.innerHTML = s.map(id => {
            const it = instruments[id];
            if (!it) return '';
            return '<div class="saved-item" data-id="' + id + '">' +
                '<img src="' + ((it.gallery || [])[0] || '') + '?w=140&q=70" alt="">' +
                '<div><h4>' + it.title + '</h4><p>' + it.kicker + '</p></div>' +
                '<button class="saved-item-remove" data-remove="' + id + '" aria-label="Remove"><i data-lucide="x"></i></button>' +
                '</div>';
        }).join('');
        refreshIcons();
        list.querySelectorAll('.saved-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('[data-remove]')) return;
                closeModal(savedDrawer);
                openDossier(item.dataset.id);
            });
        });
        list.querySelectorAll('[data-remove]').forEach(b => {
            b.addEventListener('click', (e) => { e.stopPropagation(); toggleSave(b.dataset.remove); });
        });
    }
    const savedOpen = document.getElementById('saved-open');
    if (savedOpen) savedOpen.addEventListener('click', () => openModal(savedDrawer));
    const savedCloseBtn = document.getElementById('saved-close');
    if (savedCloseBtn) savedCloseBtn.addEventListener('click', () => closeModal(savedDrawer));
    if (savedDrawer) savedDrawer.addEventListener('click', (e) => { if (e.target === savedDrawer) closeModal(savedDrawer); });

    // ---- Recently viewed ----
    const recentSection = document.getElementById('recent');
    const getRecent = () => store.get('lr-recent', []);
    function addRecent(id) {
        let r = getRecent().filter(x => x !== id);
        r.unshift(id);
        r = r.slice(0, 6);
        store.set('lr-recent', r);
        renderRecent();
    }
    function renderRecent() {
        const row = document.getElementById('recent-row');
        if (!row || !recentSection) return;
        const r = getRecent();
        if (!r.length) { recentSection.hidden = true; return; }
        recentSection.hidden = false;
        row.innerHTML = r.map(id => {
            const it = instruments[id];
            if (!it) return '';
            return '<div class="recent-card" data-id="' + id + '">' +
                '<img src="' + ((it.gallery || [])[0] || '') + '?w=400&q=75" alt="">' +
                '<h4>' + it.title + '</h4><span>' + it.kicker + '</span></div>';
        }).join('');
        row.querySelectorAll('.recent-card').forEach(c => c.addEventListener('click', () => openDossier(c.dataset.id)));
    }
    const recentClear = document.getElementById('recent-clear');
    if (recentClear) recentClear.addEventListener('click', () => { store.set('lr-recent', []); renderRecent(); toast('Cleared recently viewed'); });

    // ---- Gallery lightbox ----
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-caption');
    const lbCounter = document.getElementById('lightbox-counter');
    let lbList = [], lbIndex = 0, lbTitle = '';
    function lbRender() {
        const src = lbList[lbIndex];
        if (!src) return;
        lbImg.src = src.indexOf('?') > -1 ? src : src + '?w=1600&q=85';
        lbImg.alt = lbTitle;
        if (lbCap) lbCap.textContent = lbTitle;
        if (lbCounter) lbCounter.textContent = (lbIndex + 1) + ' / ' + lbList.length;
    }
    function openLightbox(list, title, idx) {
        lbList = list || []; lbTitle = title || ''; lbIndex = idx || 0;
        lbRender();
        openModal(lightbox);
    }
    function lbStep(dir) {
        if (!lbList.length) return;
        lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
        lbRender();
    }
    if (lightbox) {
        document.getElementById('lightbox-close').addEventListener('click', () => closeModal(lightbox));
        document.getElementById('lightbox-prev').addEventListener('click', () => lbStep(-1));
        document.getElementById('lightbox-next').addEventListener('click', () => lbStep(1));
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeModal(lightbox); });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') lbStep(-1);
            if (e.key === 'ArrowRight') lbStep(1);
        });
    }

    // ---- Dossier ----
    const dossier = document.getElementById('dossier');
    let currentDossierId = null;
    function syncDossierSave() {
        const btn = document.getElementById('dossier-save');
        if (!btn || !currentDossierId) return;
        const saved = isSaved(currentDossierId);
        btn.classList.toggle('is-saved', saved);
        btn.querySelector('.btn-text').textContent = saved ? 'Saved' : 'Save';
    }
    function openDossier(id) {
        const it = instruments[id];
        if (!it || !dossier) return;
        currentDossierId = id;
        document.getElementById('dossier-kicker').textContent = it.kicker || '';
        document.getElementById('dossier-title').textContent = it.title || '';
        document.getElementById('dossier-price').innerHTML = priceToCurrency(it.price || '');
        document.getElementById('dossier-summary').textContent = it.summary || '';
        document.getElementById('dossier-provenance').textContent = it.provenance || '';
        document.getElementById('dossier-specs').innerHTML = (it.specs || [])
            .map(s => '<div class="spec"><dt>' + s.label + '</dt><dd>' + s.value + '</dd></div>').join('');

        const hero = document.getElementById('dossier-hero');
        const thumbs = document.getElementById('dossier-thumbs');
        const gal = it.gallery || [];
        const setHero = (i) => {
            hero.src = gal[i] + '?w=1100&q=85';
            hero.alt = it.title;
            thumbs.querySelectorAll('img').forEach((t, j) => t.classList.toggle('active', j === i));
        };
        thumbs.innerHTML = gal.map((g, i) => '<img src="' + g + '?w=200&q=70" alt="" data-i="' + i + '">').join('');
        thumbs.querySelectorAll('img').forEach(img => img.addEventListener('click', () => setHero(Number(img.dataset.i))));
        if (gal.length) setHero(0);
        hero.onclick = () => {
            const active = Array.from(thumbs.querySelectorAll('img')).findIndex(t => t.classList.contains('active'));
            openLightbox(gal, it.title, active < 0 ? 0 : active);
        };

        syncDossierSave();
        openModal(dossier);
        addRecent(id);
    }
    if (dossier) {
        document.getElementById('dossier-close').addEventListener('click', () => closeModal(dossier));
        dossier.addEventListener('click', (e) => { if (e.target === dossier) closeModal(dossier); });
        document.getElementById('dossier-enquire').addEventListener('click', () => closeModal(dossier));
        document.getElementById('dossier-save').addEventListener('click', () => {
            if (currentDossierId) toggleSave(currentDossierId);
        });
    }

    // Open dossier from collection cards
    document.querySelectorAll('.property-card').forEach(card => {
        const img = card.querySelector('.property-image');
        if (img) img.addEventListener('click', (e) => {
            if (e.target.closest('.property-favorite')) return;
            if (card.dataset.id) openDossier(card.dataset.id);
        });
    });

    // ---- Search overlay ----
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    function runSearch(q) {
        if (!searchResults) return;
        q = (q || '').trim().toLowerCase();
        const ids = Object.keys(instruments);
        const matches = !q ? ids : ids.filter(id => {
            const it = instruments[id];
            return (it.title + ' ' + it.kicker + ' ' + it.summary).toLowerCase().indexOf(q) > -1;
        });
        if (!matches.length) {
            searchResults.innerHTML = '<p class="search-empty">No pieces match “' + q + '”.</p>';
            return;
        }
        searchResults.innerHTML = matches.map(id => {
            const it = instruments[id];
            return '<div class="search-result" data-id="' + id + '">' +
                '<img src="' + ((it.gallery || [])[0] || '') + '?w=120&q=70" alt="">' +
                '<div><div class="sr-title">' + it.title + '</div><div class="sr-kicker">' + it.kicker + '</div></div></div>';
        }).join('');
        searchResults.querySelectorAll('.search-result').forEach(r => {
            r.addEventListener('click', () => { closeModal(searchOverlay); openDossier(r.dataset.id); });
        });
    }
    const searchOpen = document.getElementById('search-open');
    if (searchOpen) searchOpen.addEventListener('click', () => { openModal(searchOverlay); runSearch(''); setTimeout(() => searchInput && searchInput.focus(), 350); });
    const searchCloseBtn = document.getElementById('search-close');
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', () => closeModal(searchOverlay));
    if (searchOverlay) searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeModal(searchOverlay); });
    if (searchInput) searchInput.addEventListener('input', () => runSearch(searchInput.value));

    // ---- FPS test → polite Lite suggestion ----
    const perfBanner = document.getElementById('perf-banner');
    if (isFull && !reducedMotion && !localStorage.getItem('lr-perf')) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                let frames = 0, slow = 0, last = performance.now();
                const t0 = last;
                function probe(now) {
                    frames++;
                    if (now - last > 24) slow++;
                    last = now;
                    if (now - t0 < 2500) requestAnimationFrame(probe);
                    else {
                        const avg = frames / ((now - t0) / 1000);
                        const stutter = slow / frames;
                        if ((avg < 45 || stutter > 0.25) && perfBanner) perfBanner.hidden = false;
                    }
                }
                requestAnimationFrame(probe);
            }, 1200);
        });
    }
    const perfYes = document.getElementById('perf-banner-yes');
    const perfNo = document.getElementById('perf-banner-no');
    if (perfYes) perfYes.addEventListener('click', () => { localStorage.setItem('lr-perf', 'lite'); location.reload(); });
    if (perfNo) perfNo.addEventListener('click', () => { if (perfBanner) perfBanner.hidden = true; });

    // ---- Tab-away title ----
    const baseTitle = document.title;
    document.addEventListener('visibilitychange', () => {
        document.title = document.hidden ? 'Until you return — Lars Résonance' : baseTitle;
    });

    // ---- Ambient bar: live weather + atelier hours (Open-Meteo, no key) ----
    (function ambientBar() {
        const annc = document.getElementById('announcement-text');
        const loc = DATA.location;
        if (!annc || !loc) return;
        const baseText = annc.textContent.trim();
        function statusLine() {
            try {
                const parts = new Intl.DateTimeFormat('en-GB', {
                    timeZone: loc.timeZone, hour: 'numeric', hour12: false, weekday: 'short'
                }).formatToParts(new Date());
                const hour = Number((parts.find(p => p.type === 'hour') || {}).value);
                const day = (parts.find(p => p.type === 'weekday') || {}).value;
                const open = day !== 'Sun' && hour >= loc.openHour && hour < loc.closeHour;
                return open ? ('The atelier is open until ' + loc.closeHour + '.00')
                            : ('The atelier opens at ' + loc.openHour + '.00');
            } catch (e) { return ''; }
        }
        const WMO = {
            0: 'Clear skies', 1: 'Mostly clear', 2: 'Gentle clouds', 3: 'Overcast',
            45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Drizzle',
            61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
            75: 'Heavy snow', 80: 'Passing showers', 81: 'Showers', 82: 'Heavy showers', 95: 'A passing storm'
        };
        function render(wx) {
            const s = statusLine();
            annc.innerHTML =
                (wx ? loc.label + ' <span class="wx-temp">' + wx.t + '°</span> · ' + wx.desc + ' · ' : '') +
                (s ? s + ' · ' : '') + baseText;
        }
        let cached = null;
        try { cached = JSON.parse(sessionStorage.getItem('lr-wx') || 'null'); } catch (e) {}
        if (cached && Date.now() - cached.ts < 30 * 60 * 1000) { render(cached); return; }
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude + '&current=temperature_2m,weather_code&temperature_unit=celsius')
            .then(r => r.json())
            .then(j => {
                const wx = {
                    t: Math.round(j.current.temperature_2m),
                    desc: WMO[j.current.weather_code] || 'Local weather',
                    ts: Date.now()
                };
                try { sessionStorage.setItem('lr-wx', JSON.stringify(wx)); } catch (e) {}
                render(wx);
            })
            .catch(() => render(null));
    })();

    // ---- Luxury CTA video: pause off-screen + respect Save-Data / Lite ----
    (function manageVideo() {
        const vid = document.querySelector('.luxury-video');
        if (!vid) return;
        const conn = navigator.connection || {};
        if (conn.saveData || !isFull) {
            vid.pause();
            vid.removeAttribute('autoplay');
            return;
        }
        new IntersectionObserver((entries) => {
            entries.forEach(en => { en.isIntersecting ? vid.play().catch(() => {}) : vid.pause(); });
        }, { threshold: 0.1 }).observe(vid);
    })();

    // ---- Scroll progress indicator ----
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        const onProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            progressBar.style.transform = 'scaleX(' + ratio + ')';
        };
        window.addEventListener('scroll', onProgress, { passive: true });
        onProgress();
    }

    // ---- Announcement bar tucks away on scroll ----
    const announceBar = document.getElementById('announce');
    if (announceBar) {
        const onAnnounceScroll = () => announceBar.classList.toggle('hidden', window.scrollY > 80);
        window.addEventListener('scroll', onAnnounceScroll, { passive: true });
        onAnnounceScroll();
    }

    // ---- Settings menu (gear dropdown, desktop) ----
    const settingsOpen = document.getElementById('settings-open');
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsOpen && settingsPanel) {
        const closeSettings = () => {
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
            if (settingsPanel.classList.contains('open') &&
                !settingsPanel.contains(e.target) && !settingsOpen.contains(e.target)) closeSettings();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });
    }

    // ---- Mobile quick buttons (inside the hamburger menu) ----
    const mobileMenuEl = document.getElementById('mobile-menu');
    const navToggleEl = document.getElementById('nav-toggle');
    function closeMobileMenu() {
        if (navToggleEl) navToggleEl.classList.remove('active');
        if (mobileMenuEl) mobileMenuEl.classList.remove('active');
        document.body.style.overflow = '';
    }
    const sOpenM = document.getElementById('search-open-m');
    if (sOpenM && searchOverlay) sOpenM.addEventListener('click', () => {
        closeMobileMenu();
        openModal(searchOverlay); runSearch('');
        setTimeout(() => searchInput && searchInput.focus(), 350);
    });
    const savOpenM = document.getElementById('saved-open-m');
    if (savOpenM && savedDrawer) savOpenM.addEventListener('click', () => {
        closeMobileMenu();
        openModal(savedDrawer);
    });

    // ---- i18n engine ----
    const I18N = DATA.i18n || {};
    const norm = (s) => (s || '').replace(/[‘’']/g, "'").replace(/\s+/g, ' ').trim();
    function applyLang(lang) {
        const pack = I18N[lang] || {};
        const keyed = pack.keyed || {};
        const ntext = {}, nhtml = {};
        Object.keys(pack.text || {}).forEach(k => { ntext[norm(k)] = pack.text[k]; });
        Object.keys(pack.html || {}).forEach(k => { nhtml[norm(k)] = pack.html[k]; });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            if (el.dataset.en == null) el.dataset.en = el.textContent;
            el.textContent = (lang === 'en') ? el.dataset.en : (keyed[k] || el.dataset.en);
        });

        const textSel = '.nav-link,.mobile-link,.hero-subtitle,.title-word,.section-desc,' +
            '.about-text,.about-feature h4,.about-feature p,.stat-label,.filter-btn,' +
            '.property-location span,.property-title,.neighborhood-city,.neighborhood-content h3,' +
            '.neighborhood-content p,.service-card h3,.service-card p,.service-link span,' +
            '.testimonial-text,.author-info span,.makers-label,.press-label,.press-award span,' +
            '.recent-label,.recent-clear,.contact-desc,.contact-item h4,.btn-text,.booking-label,' +
            '.slots-label,.footer-tagline,.footer-links-group h4,.footer-links-group a,' +
            '.footer-bottom p,.settings-panel-title,.listen-text';
        document.querySelectorAll(textSel).forEach(el => {
            if (el.querySelector('[data-eur]')) return;
            if (el.dataset.en == null) el.dataset.en = el.textContent.trim();
            el.textContent = (lang === 'en') ? el.dataset.en : (ntext[norm(el.dataset.en)] || el.dataset.en);
        });

        document.querySelectorAll('.section-title,.luxury-cta-content h2,.exp-text,label').forEach(el => {
            if (el.dataset.enhtml == null) el.dataset.enhtml = norm(el.innerHTML);
            const key = norm(el.dataset.enhtml);
            el.innerHTML = (lang === 'en') ? el.dataset.enhtml : (nhtml[key] || ntext[key] || el.dataset.enhtml);
        });

        document.documentElement.setAttribute('lang', lang);
        store.set('lr-lang', lang);
    }

    // ---- Segmented controls (language / currency / theme / effects) ----
    const initLang = store.get('lr-lang', 'en');
    function syncSegs(ctl, val) {
        document.querySelectorAll('.seg[data-ctl="' + ctl + '"] button')
            .forEach(b => b.classList.toggle('active', b.dataset.val === val));
    }
    syncSegs('lang', initLang);
    syncSegs('currency', activeCurrency);
    syncSegs('theme', currentTheme());
    syncSegs('effects', perfMode);

    document.querySelectorAll('.seg').forEach(seg => {
        const ctl = seg.dataset.ctl;
        seg.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                if (ctl === 'currency') { applyCurrency(val); syncSegs('currency', val); }
                else if (ctl === 'theme') { setTheme(val); syncSegs('theme', val); }
                else if (ctl === 'lang') { applyLang(val); syncSegs('lang', val); }
                else if (ctl === 'effects') {
                    if (val === perfMode) return;
                    localStorage.setItem('lr-perf', val);
                    location.reload();
                }
            });
        });
    });

    applyLang(initLang);

    // ---- Initialise the stateful pieces ----
    syncSavedUI();
    renderRecent();

    // ---- Booking calendar (client-side only) ----
    const calGrid = document.getElementById('cal-grid');
    if (calGrid) {
        const calMonth = document.getElementById('cal-month');
        const calPrev = document.getElementById('cal-prev');
        const calNext = document.getElementById('cal-next');
        const timeSlots = document.getElementById('time-slots');
        const bookingInput = document.getElementById('booking-when');
        const bookingSummary = document.getElementById('booking-summary');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let view = new Date(firstOfThisMonth);
        let selectedDate = null;
        let selectedTime = null;

        const updateSummary = () => {
            if (selectedDate && selectedTime) {
                const txt = selectedDate.toLocaleDateString('en-GB',
                    { weekday: 'long', day: 'numeric', month: 'long' }) + ' at ' + selectedTime;
                bookingInput.value = txt;
                bookingSummary.textContent = '✓ Private audition requested for ' + txt;
            } else if (selectedDate) {
                bookingInput.value = '';
                bookingSummary.textContent = 'Now choose a time.';
            }
        };

        const render = () => {
            calGrid.innerHTML = '';
            calMonth.textContent = monthNames[view.getMonth()] + ' ' + view.getFullYear();
            const year = view.getFullYear();
            const month = view.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const offset = (firstDay + 6) % 7; // Monday-first
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < offset; i++) {
                const e = document.createElement('span');
                e.className = 'cal-day empty';
                calGrid.appendChild(e);
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cal-day';
                btn.textContent = d;
                const date = new Date(year, month, d);
                const dow = date.getDay();
                if (date < today || dow === 0) btn.classList.add('disabled'); // closed Sundays + past
                if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add('selected');
                btn.addEventListener('click', () => {
                    selectedDate = date;
                    selectedTime = null;
                    timeSlots.hidden = false;
                    timeSlots.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                    render();
                    updateSummary();
                });
                calGrid.appendChild(btn);
            }
        };

        calPrev.addEventListener('click', () => {
            const prev = new Date(view.getFullYear(), view.getMonth() - 1, 1);
            if (prev < firstOfThisMonth) return;
            view = prev;
            render();
        });
        calNext.addEventListener('click', () => {
            view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
            render();
        });
        timeSlots.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('click', () => {
                timeSlots.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTime = slot.dataset.time;
                updateSummary();
            });
        });

        render();
    }

    // ---- Smooth page load ----
    document.body.style.opacity = '1';

    console.log('%c LARS RÉSONANCE ', 'background: #0A1628; color: #C9A96E; font-size: 14px; padding: 10px 20px; font-family: Georgia;');
    console.log('%c Pianos & High-End Audio Atelier ', 'color: #9A7D3E; font-size: 11px; padding: 4px;');
});
