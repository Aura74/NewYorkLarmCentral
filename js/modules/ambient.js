/* ambient.js — announcement bar with live weather + opening hours (Open-Meteo, no key). */
import { DATA } from '../data.js';
import { t, currentLang } from './i18n.js';

const WMO = {
    0: 'Clear skies', 1: 'Mostly clear', 2: 'Gentle clouds', 3: 'Overcast',
    45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
    75: 'Heavy snow', 80: 'Passing showers', 81: 'Showers', 82: 'Heavy showers', 95: 'A passing storm',
};

export function init() {
    const annc = document.getElementById('announcement-text');
    const loc = DATA.location;
    if (annc && loc) {
        const baseKey = annc.getAttribute('data-i18n') || '';
        const baseEN = annc.textContent.trim();
        const base = () => (baseKey ? t(baseKey) : baseEN);
        const statusLine = () => {
            try {
                const parts = new Intl.DateTimeFormat('en-GB', { timeZone: loc.timeZone, hour: 'numeric', hour12: false, weekday: 'short' }).formatToParts(new Date());
                const hour = Number((parts.find((p) => p.type === 'hour') || {}).value);
                const day = (parts.find((p) => p.type === 'weekday') || {}).value;
                const open = day !== 'Sun' && hour >= loc.openHour && hour < loc.closeHour;
                return open ? t('openUntil') + ' ' + loc.closeHour + '.00' : t('opensAt') + ' ' + loc.openHour + '.00';
            } catch (e) { return ''; }
        };
        const describe = (code) => {
            const sv = ((DATA.i18n || {}).sv || {}).weather || {};
            return (currentLang() === 'sv' ? sv[code] : WMO[code]) || WMO[code] || t('weather');
        };
        let lastWx = null;
        const render = (wx) => {
            lastWx = wx;
            annc.replaceChildren();
            if (wx) {
                const temp = document.createElement('span');
                temp.className = 'wx-temp';
                temp.textContent = wx.t + '°';
                annc.append(loc.label + ' ', temp, ' · ' + describe(wx.code) + ' · ');
            }
            const s = statusLine();
            annc.append((s ? s + ' · ' : '') + base());
        };
        document.addEventListener('lr:lang', () => render(lastWx));
        let cached = null;
        try { cached = JSON.parse(sessionStorage.getItem('lr-wx') || 'null'); } catch (e) { /* ignore */ }
        if (cached && cached.code != null && Date.now() - cached.ts < 30 * 60 * 1000) {
            render(cached);
        } else {
            render(null);
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`)
                .then((r) => r.json())
                .then((j) => {
                    const wx = { t: Math.round(j.current.temperature_2m), code: j.current.weather_code, ts: Date.now() };
                    try { sessionStorage.setItem('lr-wx', JSON.stringify(wx)); } catch (e) { /* ignore */ }
                    render(wx);
                })
                .catch(() => {});
        }
    }
}
