/* ============================================================
   MANHATTAN MIAMI CENTRAL - Premium Interactive Experience
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

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
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
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

    // ---- Hero Particles ----
    const particlesContainer = document.getElementById('hero-particles');
    for (let i = 0; i < 30; i++) {
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
                    duration: 2,
                    ease: 'expo.out',
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

    // Property card 3D tilt effect
    propertyCards.forEach(card => {
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
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

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
            submitBtn.querySelector('.btn-text').textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';

            setTimeout(() => {
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2500);
        }, 1500);
    });

    // ---- Favorite Button Toggle ----
    document.querySelectorAll('.property-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('favorited');
            if (btn.classList.contains('favorited')) {
                btn.style.background = 'var(--gold-400)';
                btn.style.color = 'var(--white)';
                // Heart fill animation
                gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
            } else {
                btn.style.background = '';
                btn.style.color = '';
            }
        });
    });

    // ---- Footer reveal ----
    revealOnScroll('.footer-top > *', { opacity: 0, y: 30 }, 0.1);

    // ---- Parallax on Stats Background ----
    gsap.to('.stats-bg', {
        scrollTrigger: {
            trigger: '.stats',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -80,
        ease: 'none'
    });

    // ---- Marquee speed variation on scroll ----
    let marqueeSpeed = 30;
    ScrollTrigger.create({
        trigger: '.marquee-section',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
            const velocity = self.getVelocity() / 500;
            const newDuration = Math.max(10, 30 - Math.abs(velocity));
            document.querySelector('.marquee-content').style.animationDuration = newDuration + 's';
        }
    });

    // ---- Smooth page load ----
    document.body.style.opacity = '1';

    console.log('%c MANHATTAN MIAMI CENTRAL ', 'background: #0A1628; color: #C9A96E; font-size: 14px; padding: 10px 20px; font-family: Georgia;');
    console.log('%c Luxury Real Estate Experience ', 'color: #9A7D3E; font-size: 11px; padding: 4px;');
});
