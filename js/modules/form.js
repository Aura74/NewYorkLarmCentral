/* form.js — contact form: inline validation, honeypot, status for screen readers,
   optional backend (DATA.formEndpoint) with simulated success when none is configured. */
import { DATA } from '../data.js';
import { t } from './i18n.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const statusEl = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

    const rules = {
        firstName: { test: (v) => v.trim().length >= 2, msg: 'errName' },
        lastName: { test: (v) => v.trim().length >= 2, msg: 'errName' },
        email: { test: (v) => EMAIL_RE.test(v.trim()), msg: 'errEmail' },
        interest: { test: (v) => !!v, msg: 'errInterest' },
        message: { test: (v) => v.trim().length >= 10, msg: 'errMessage' },
    };

    function setError(name, key) {
        const input = form.querySelector(`[name="${name}"]`);
        const slot = form.querySelector(`[data-error-for="${name}"]`);
        const group = input && input.closest('.form-group');
        if (slot) slot.textContent = key ? t(key) : '';
        if (group) group.classList.toggle('has-error', !!key);
        if (input) input.setAttribute('aria-invalid', key ? 'true' : 'false');
    }
    function validate(name) {
        const input = form.querySelector(`[name="${name}"]`);
        const rule = rules[name];
        if (!input || !rule) return true;
        const ok = rule.test(input.value);
        setError(name, ok ? null : rule.msg);
        return ok;
    }
    function setStatus(type, msg) {
        if (!statusEl) return;
        statusEl.textContent = msg || '';
        statusEl.classList.remove('success', 'error');
        if (type) statusEl.classList.add(type);
        statusEl.classList.toggle('visible', !!msg);
        if (msg) statusEl.focus();
    }

    Object.keys(rules).forEach((name) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (!input) return;
        input.addEventListener('blur', () => { if (input.value) validate(name); });
        input.addEventListener('input', () => setError(name, null));
        input.addEventListener('change', () => setError(name, null));
    });

    // "Learn more" on a service pre-selects the matching interest
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-interest]');
        if (!a) return;
        const sel = form.querySelector('#interest');
        if (sel) { sel.value = a.dataset.interest; sel.dispatchEvent(new Event('change')); }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus(null, '');
        let firstInvalid = null;
        Object.keys(rules).forEach((name) => { if (!validate(name) && !firstInvalid) firstInvalid = name; });
        if (firstInvalid) { form.querySelector(`[name="${firstInvalid}"]`).focus(); return; }

        const honeypot = form.querySelector('[name="website"]');
        const payload = Object.fromEntries(new FormData(form).entries());
        delete payload.website;
        payload.lang = document.documentElement.lang;

        const original = btnText ? btnText.textContent : '';
        if (btnText) btnText.textContent = t('sending');
        if (submitBtn) submitBtn.disabled = true;

        let ok = true;
        if (honeypot && honeypot.value) {
            ok = true; // a bot filled the hidden field: pretend to succeed, send nothing
        } else if (DATA.formEndpoint) {
            try {
                const r = await fetch(DATA.formEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload),
                });
                ok = r.ok;
            } catch (err) { ok = false; }
        } else {
            await new Promise((r) => setTimeout(r, 1200)); // no backend configured: simulate
        }

        if (btnText) btnText.textContent = ok ? t('received') : original;
        if (submitBtn) submitBtn.disabled = false;
        setStatus(ok ? 'success' : 'error', ok ? t('formSent') : t('formError'));
        if (ok) {
            form.reset();
            const summary = document.getElementById('booking-summary');
            if (summary) summary.textContent = '';
            const slots = document.getElementById('time-slots');
            if (slots) slots.hidden = true;
            setTimeout(() => { if (btnText) btnText.textContent = original; }, 2500);
        }
    });
}
