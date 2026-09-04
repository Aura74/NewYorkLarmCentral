/* sliders.js — Swiper carousels (Spaces + testimonials) and footer deep links into them. */
import { isLite } from './env.js';

let spaceSwiper = null;

export function init() {
    if (!window.Swiper) return;
    spaceSwiper = new window.Swiper('.space-swiper', {
        slidesPerView: 1.2, spaceBetween: 24, speed: isLite ? 0 : 800, grabCursor: true,
        loop: true, loopAdditionalSlides: 2,
        pagination: { el: '.swiper-pagination-custom', clickable: true },
        navigation: { nextEl: '.swiper-btn-next', prevEl: '.swiper-btn-prev' },
        breakpoints: {
            640: { slidesPerView: 1.8, spaceBetween: 24 },
            1024: { slidesPerView: 2.5, spaceBetween: 32 },
            1400: { slidesPerView: 3.2, spaceBetween: 32 },
        },
    });
    new window.Swiper('.testimonial-swiper', {
        slidesPerView: 1, spaceBetween: 32, speed: isLite ? 0 : 600,
        autoplay: isLite ? false : { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.testimonial-pagination', clickable: true },
        breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } },
    });
    // Footer "Spaces" links jump to the matching slide
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-slide]');
        if (a && spaceSwiper) setTimeout(() => spaceSwiper.slideToLoop(Number(a.dataset.slide), isLite ? 0 : 800), 400);
    });
}
