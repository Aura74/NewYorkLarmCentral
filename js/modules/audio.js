/* audio.js — "Hear it": a rendered voicing per instrument via Web Audio (no files),
   with A/B comparison. When an instrument has `audio: 'url'` a real recording is used instead.
   Placeholder by design: swap in studio recordings without touching the UI. */
let ctx = null;
let current = null; // { stop() }

function context() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function renderVoice(voice, startAt) {
    const ac = context();
    const v = Object.assign({ type: 'piano', harmonics: [1, 0.5, 0.25], decay: 2, notes: [261.63], step: 0.28, cutoff: 8000 }, voice || {});
    const master = ac.createGain();
    master.gain.value = 0.9;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = v.cutoff;
    master.connect(filter);
    let tail = filter;
    if (v.echo) {
        const delay = ac.createDelay(1.0);
        delay.delayTime.value = v.echo;
        const fb = ac.createGain();
        fb.gain.value = 0.28;
        filter.connect(delay); delay.connect(fb); fb.connect(delay);
        delay.connect(ac.destination);
    }
    tail.connect(ac.destination);

    const nodes = [];
    v.notes.forEach((freq, i) => {
        const t = startAt + i * v.step;
        const env = ac.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(v.type === 'pad' ? 0.16 : 0.22, t + (v.type === 'pad' ? 0.35 : 0.012));
        env.gain.exponentialRampToValueAtTime(0.0001, t + v.decay);
        env.connect(master);
        const partials = v.type === 'saw' ? [[1, 1]] : v.harmonics.map((amp, k) => [k + 1, amp]);
        partials.forEach(([mult, amp]) => {
            const osc = ac.createOscillator();
            osc.type = v.type === 'saw' ? 'sawtooth' : 'sine';
            osc.frequency.value = freq * mult;
            if (v.type === 'pad') osc.detune.value = (Math.random() - 0.5) * 8;
            const g = ac.createGain();
            g.gain.value = amp;
            osc.connect(g); g.connect(env);
            osc.start(t); osc.stop(t + v.decay + 0.1);
            nodes.push(osc);
        });
    });
    const length = (v.notes.length - 1) * v.step + v.decay + (v.echo ? 1.2 : 0.2);
    return { length, stop: () => nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } }) };
}

function playInstrument(instrument, startAt) {
    if (instrument.audio) {
        const el = new Audio(instrument.audio);
        el.play().catch(() => {});
        return { length: 6, stop: () => { el.pause(); } };
    }
    return renderVoice(instrument.voice, startAt);
}

export function stop() {
    if (current) { current.stop(); current = null; }
}

/** Play one instrument; resolves when finished. */
export function play(instrument) {
    stop();
    const now = context().currentTime + 0.05;
    const h = playInstrument(instrument, now);
    return finish(h, h.length);
}

/** Play A, a short pause, then B — the same phrase through two voicings. */
export function playAB(a, b) {
    stop();
    const now = context().currentTime + 0.05;
    const ha = playInstrument(a, now);
    const gap = 0.6;
    const hb = playInstrument(b, now + ha.length + gap);
    const both = { stop: () => { ha.stop(); hb.stop(); } };
    return finish(both, ha.length + gap + hb.length);
}

function finish(handle, seconds) {
    current = handle;
    return new Promise((resolve) => {
        const timer = setTimeout(() => { if (current === handle) current = null; resolve(); }, seconds * 1000);
        handle.stop = ((orig) => () => { clearTimeout(timer); orig(); resolve(); })(handle.stop);
    });
}
