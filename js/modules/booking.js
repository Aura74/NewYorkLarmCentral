/* booking.js — client-side audition calendar (Monday-first, Sundays and past days closed). */
import { t, locale } from './i18n.js';

export function init() {
    const calGrid = document.getElementById('cal-grid');
    if (!calGrid) return;
    const calMonth = document.getElementById('cal-month');
    const timeSlots = document.getElementById('time-slots');
    const bookingInput = document.getElementById('booking-when');
    const bookingSummary = document.getElementById('booking-summary');

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let view = new Date(firstOfThisMonth);
    let selectedDate = null;
    let selectedTime = null;

    const updateSummary = () => {
        if (selectedDate && selectedTime) {
            const txt = selectedDate.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' }) + ' ' + t('at') + ' ' + selectedTime;
            bookingInput.value = txt;
            bookingSummary.textContent = t('requested') + ' ' + txt;
        } else if (selectedDate) {
            bookingInput.value = '';
            bookingSummary.textContent = t('chooseTime');
        }
    };

    const render = () => {
        calGrid.replaceChildren();
        const label = view.toLocaleDateString(locale(), { month: 'long', year: 'numeric' });
        calMonth.textContent = label.charAt(0).toUpperCase() + label.slice(1);
        const year = view.getFullYear(), month = view.getMonth();
        const offset = (new Date(year, month, 1).getDay() + 6) % 7;
        const days = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < offset; i++) { const e = document.createElement('span'); e.className = 'cal-day empty'; calGrid.appendChild(e); }
        for (let d = 1; d <= days; d++) {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'cal-day'; btn.textContent = d;
            const date = new Date(year, month, d);
            if (date < today || date.getDay() === 0) btn.classList.add('disabled');
            if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add('selected');
            btn.addEventListener('click', () => {
                selectedDate = date; selectedTime = null;
                timeSlots.hidden = false;
                timeSlots.querySelectorAll('.slot').forEach((s) => s.classList.remove('selected'));
                render(); updateSummary();
            });
            calGrid.appendChild(btn);
        }
    };

    document.getElementById('cal-prev').addEventListener('click', () => {
        const prev = new Date(view.getFullYear(), view.getMonth() - 1, 1);
        if (prev < firstOfThisMonth) return;
        view = prev; render();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render();
    });
    timeSlots.querySelectorAll('.slot').forEach((slot) => {
        slot.addEventListener('click', () => {
            timeSlots.querySelectorAll('.slot').forEach((s) => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedTime = slot.dataset.time;
            updateSummary();
        });
    });
    render();
    document.addEventListener('lr:lang', () => { render(); updateSummary(); });
}
