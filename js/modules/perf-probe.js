/* perf-probe.js — measures the frame rate once after load and politely suggests
   stepping ONE effects tier down. Only when the visitor has not chosen a tier. */
import { TIERS, perfMode, setPerf, store } from './env.js';
import { t } from './i18n.js';

export function init() {
    const banner = document.getElementById('perf-banner');
    const lowerTier = TIERS[TIERS.indexOf(perfMode) - 1];
    const saved = store.raw('lr-perf');
    const yes = document.getElementById('perf-banner-yes');
    const no = document.getElementById('perf-banner-no');

    if (banner && lowerTier && !saved) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (document.hidden) return;
                let frames = 0, slow = 0, last = performance.now();
                const t0 = last;
                const probe = (now) => {
                    frames++;
                    if (now - last > 24) slow++;
                    last = now;
                    if (now - t0 < 2500) { requestAnimationFrame(probe); return; }
                    if (document.hidden) return;
                    const avg = frames / ((now - t0) / 1000);
                    if (avg < 45 || slow / frames > 0.25) {
                        const txt = document.getElementById('perf-banner-text');
                        if (txt) txt.textContent = t('perfHeavy');
                        if (yes) yes.textContent = t('perfSwitch') + ' ' + t('tier.' + lowerTier);
                        if (no) no.textContent = t('perfNo');
                        banner.hidden = false;
                    }
                };
                requestAnimationFrame(probe);
            }, 1200);
        });
    }
    if (yes) yes.addEventListener('click', () => setPerf(lowerTier));
    if (no) no.addEventListener('click', () => {
        if (banner) banner.hidden = true;
        try { localStorage.setItem('lr-perf', perfMode); } catch (e) { /* ignore */ }
    });
}
