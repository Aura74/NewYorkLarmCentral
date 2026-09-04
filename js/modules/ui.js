/* ui.js — toasts and the shared modal scaffolding (focus trap, Escape, scroll lock). */
import { refreshIcons } from './env.js';
import { getLenis } from './scroll.js';

const toastsEl = document.getElementById('toasts');

export function toast(msg, icon) {
    if (!toastsEl) return;
    const el = document.createElement('div');
    el.className = 'toast';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', icon || 'check');
    i.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = msg;
    el.append(i, span);
    toastsEl.appendChild(el);
    refreshIcons();
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3200);
}

let activeModal = null;
let lastFocused = null;

function trapKey(modal) {
    return (e) => {
        if (e.key !== 'Tab') return;
        const list = Array.from(modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'))
            .filter((el) => el.offsetParent !== null);
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
}

export function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const lenis = getLenis();
    if (lenis) lenis.stop();
    activeModal = modal;
    modal._trap = trapKey(modal);
    modal.addEventListener('keydown', modal._trap);
    const focusables = modal.querySelectorAll('button,a[href],input,select');
    if (focusables.length) focusables[0].focus();
}

export function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active', 'no-fade');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const lenis = getLenis();
    if (lenis) lenis.start();
    if (modal._trap) modal.removeEventListener('keydown', modal._trap);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    if (activeModal === modal) activeModal = null;
}

export const isModalOpen = (modal) => modal && modal.classList.contains('active');

export function init() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) closeModal(activeModal);
    });
    // Clicking the dimmed backdrop closes
    document.querySelectorAll('.dossier, .drawer, .search-overlay, .lightbox').forEach((m) => {
        m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
    });
}
