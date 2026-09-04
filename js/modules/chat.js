/* ============================================================
   chat.js — Concierge chat (ES module)
   Scripted intent matching (EN + SV) with a typing indicator and
   quick-reply chips. Ready for a real LLM: set DATA.chatEndpoint to a
   backend URL and getReply() POSTs the conversation there (never put API
   keys in client code). Falls back to the scripted answers if unreachable.
   ============================================================ */
import { DATA } from '../data.js';

export function init() {
    const fab = document.getElementById('chat-fab');
    const widget = document.getElementById('chat-widget');
    const closeBtn = document.getElementById('chat-close');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const body = document.getElementById('chat-body');
    const chips = document.getElementById('chat-chips');
    const status = document.getElementById('chat-status-text');
    if (!fab || !widget || !body) return;

    const ENDPOINT = DATA.chatEndpoint || null;
    const perf = document.documentElement.dataset.perf;
    const reducedMotion = perf === 'lite' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const REPLY_DELAY = reducedMotion ? 200 : 850;

    const lang = () => (document.documentElement.getAttribute('lang') === 'sv' ? 'sv' : 'en');
    const pick = (obj) => obj[lang()] || obj.en;

    const UI = {
        welcome: {
            en: 'Welcome to Lars Résonance. Ask me about our grands, studio monitors, consoles — or book a private audition.',
            sv: 'Välkommen till Lars Résonance. Fråga mig om våra flyglar, studiomonitorer och mixerbord — eller boka en privat visning.'
        },
        placeholder: { en: 'Write a message…', sv: 'Skriv ett meddelande…' },
        typing: { en: 'Typing…', sv: 'Skriver…' },
        status: { en: 'Online — replies instantly', sv: 'Online — svarar direkt' },
        open: { en: 'Open the concierge chat', sv: 'Öppna concierge-chatten' },
        close: { en: 'Close the chat', sv: 'Stäng chatten' },
        book: { en: 'Book an audition', sv: 'Boka visning' },
        contact: { en: 'Contact details', sv: 'Kontaktuppgifter' }
    };

    /* ---- Open / close ---- */
    let lastFocused = null;
    const isOpen = () => widget.getAttribute('aria-hidden') === 'false';

    function open() {
        lastFocused = document.activeElement;
        widget.setAttribute('aria-hidden', 'false');
        fab.setAttribute('aria-expanded', 'true');
        fab.setAttribute('aria-label', pick(UI.close));
        fab.classList.add('is-open');
        setTimeout(() => input && input.focus(), reducedMotion ? 0 : 200);
    }
    function shut() {
        widget.setAttribute('aria-hidden', 'true');
        fab.setAttribute('aria-expanded', 'false');
        fab.setAttribute('aria-label', pick(UI.open));
        fab.classList.remove('is-open');
        (lastFocused && lastFocused.focus ? lastFocused : fab).focus();
    }

    fab.addEventListener('click', () => (isOpen() ? shut() : open()));
    if (closeBtn) closeBtn.addEventListener('click', shut);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) shut();
    });

    /* ---- Language: re-render static strings when main.js switches language ---- */
    function applyLang() {
        if (input) input.placeholder = pick(UI.placeholder);
        if (status) status.textContent = pick(UI.status);
        fab.setAttribute('aria-label', pick(isOpen() ? UI.close : UI.open));
        const first = body.querySelector('.chat-msg');
        if (first && body.children.length === 1 && first.dataset.welcome) {
            first.textContent = pick(UI.welcome);
        }
    }
    document.addEventListener('lr:lang', applyLang);

    /* ---- Messages ---- */
    const history = [];

    function appendMsg(text, who, link) {
        const div = document.createElement('div');
        div.className = 'chat-msg chat-msg-' + (who === 'user' ? 'user' : 'bot');
        div.textContent = text;
        if (link) {
            const a = document.createElement('a');
            a.className = 'chat-msg-link';
            a.href = link.href;
            a.textContent = pick(link.label);
            a.addEventListener('click', () => shut());
            div.appendChild(document.createElement('br'));
            div.appendChild(a);
        }
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        history.push({ role: who === 'user' ? 'user' : 'assistant', content: text });
        return div;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg chat-msg-bot chat-typing';
        div.setAttribute('aria-label', pick(UI.typing));
        for (let i = 0; i < 3; i++) div.appendChild(document.createElement('span'));
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div;
    }

    async function send(text) {
        if (!text) return;
        appendMsg(text, 'user');
        if (input) input.value = '';
        if (chips) chips.hidden = true;
        const typing = showTyping();
        const started = Date.now();
        const reply = await getReply(text);
        const wait = Math.max(0, REPLY_DELAY - (Date.now() - started));
        setTimeout(() => {
            typing.remove();
            appendMsg(reply.text, 'bot', reply.link);
        }, wait);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            send((input.value || '').trim());
        });
    }
    if (chips) {
        chips.addEventListener('click', (e) => {
            const btn = e.target.closest('.chat-chip');
            if (btn) send(btn.textContent.trim());
        });
    }

    /* ---- Reply source: backend if configured, otherwise the scripted intents ---- */
    async function getReply(text) {
        if (ENDPOINT) {
            try {
                const r = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lang: lang(), messages: history.slice(-12) })
                });
                if (r.ok) {
                    const j = await r.json();
                    if (j && j.reply) return { text: String(j.reply) };
                }
            } catch (e) { /* fall through to scripted replies */ }
        }
        return scripted(text);
    }

    const BOOK = { href: '#contact', label: UI.book };
    const CONTACT = { href: '#contact', label: UI.contact };

    /* Intent table — one regex per intent, matching both English and Swedish.
       Order = priority; specific topics come before generic greetings. */
    const INTENTS = [
        {
            re: /(boka|bokning|visning|provspel|audition|appointment|book|schedule|viewing|besök|visit)/i,
            en: 'Private auditions are by appointment at Strandvägen 7A, Stockholm — Monday to Saturday, 9.00–18.00. Pick a date and time in the booking form and we will confirm within the day.',
            sv: 'Privata visningar sker efter överenskommelse på Strandvägen 7A i Stockholm, måndag–lördag 9.00–18.00. Välj datum och tid i bokningsformuläret så bekräftar vi samma dag.',
            link: BOOK
        },
        {
            re: /(stäm|tuning|tune\b|voicing|intoner|reglering|regulation|underhåll|maintenance|repair|reparation|service)/i,
            en: 'Our master technicians tune, regulate and voice by hand to concert standard — in the atelier or in your own room. Concert tuning starts at €290; a full regulation and voicing is quoted after a short inspection.',
            sv: 'Våra mästartekniker stämmer, reglerar och intonerar för hand på konsertnivå — i ateljén eller i ditt eget rum. Konsertstämning från 2 900 kr; full reglering och intonering offereras efter en kort besiktning.',
            link: BOOK
        },
        {
            re: /(piano|flygel|flyglar|grand|steinway|bösendorfer|fazioli|upright|konzert|klaver|tangent|keys\b)/i,
            en: 'We represent Steinway & Sons, Bösendorfer and Fazioli. Our flagship is the Konzert Grand 280, voiced note by note in our Stockholm workshop over six weeks before delivery. Would you like to hear it?',
            sv: 'Vi representerar Steinway & Sons, Bösendorfer och Fazioli. Flaggskeppet är Konzert Grand 280, intonerad ton för ton i vår Stockholmsverkstad under sex veckor före leverans. Vill du höra den?',
            link: BOOK
        },
        {
            re: /(synth|keyboard|analog|moog|prophet|polyfon|polyphon)/i,
            en: 'The analogue synth collection ranges from iconic polyphonic classics to modern 88-key weighted controllers, from €4,200. Every unit is serviced, calibrated and bench-tested before it leaves the atelier.',
            sv: 'Synthsamlingen sträcker sig från ikoniska polyfona klassiker till moderna vägda 88-tangenters kontroller, från 47 000 kr. Varje enhet är servad, kalibrerad och bänktestad innan den lämnar ateljén.'
        },
        {
            re: /(monitor|högtalar|speaker|lyssn|listening|hi-?fi|bowers|b&w|förstärk|amplifier|\bamp\b)/i,
            en: 'The Référence Monitor System is a three-way reference pair with a dedicated Class-A amplifier, flat from 20 Hz to 40 kHz, from €36,500 per pair — calibrated to your room during installation.',
            sv: 'Référence Monitor System är ett trevägs referenspar med dedikerad klass A-förstärkare, rakt från 20 Hz till 40 kHz, från 395 000 kr per par — kalibrerat till ditt rum vid installationen.'
        },
        {
            re: /(console|mixer|mixerbord|neve|\bssl\b|\bmic|mikrofon|neumann|tube|rörmik)/i,
            en: 'We supply hand-built 48-channel analogue consoles with total recall (made to order) and vintage-style tube microphones from €9,800, each tested against a reference before shipping.',
            sv: 'Vi levererar handbyggda 48-kanals analoga mixerbord med total recall (byggda på beställning) och rörmikrofoner i klassisk tradition från 105 000 kr, var och en testad mot en referens före leverans.'
        },
        {
            re: /(studio|akustik|acoustic|treatment|design|build|bygga|kontrollrum|control room|mastering)/i,
            en: 'Bespoke Studio Design is a turnkey commission — acoustics, treatment, monitoring, console and wiring — typically delivered in 12–20 weeks with lifetime aftercare. We start with an acoustic survey of your space.',
            sv: 'Bespoke Studio Design är ett nyckelfärdigt uppdrag — akustik, rumsbehandling, monitorering, mixerbord och kablage — normalt levererat inom 12–20 veckor med livstids eftervård. Vi börjar med en akustisk besiktning av ditt rum.',
            link: BOOK
        },
        {
            re: /(lever|deliver|transport|frakt|shipping|install|flytt|move)/i,
            en: 'White-glove delivery means climate-controlled transport, expert installation and a final on-site voicing. Your instrument arrives ready to perform, never merely delivered.',
            sv: 'Leverans med silkesvantar innebär klimatstyrd transport, expertinstallation och en avslutande intonering på plats. Instrumentet anländer spelklart — inte bara levererat.'
        },
        {
            re: /(pris|kost|cost|price|how much|vad tar|budget|betal|\bpay|finans|financ|hyra|rent|lease)/i,
            en: 'Pieces range from €4,200 for the synth collection to price-on-request for concert grands and commissions. Every quotation is all-inclusive — delivery, installation and first voicing — and financing or leasing can be arranged.',
            sv: 'Priserna sträcker sig från 47 000 kr för synthsamlingen till pris på begäran för konsertflyglar och uppdrag. Varje offert är allt inkluderat — leverans, installation och första intonering — och finansiering eller leasing kan ordnas.',
            link: CONTACT
        },
        {
            re: /(öppet|öppettider|opening|hours|open\b|adress|address|var (finns|ligger)|where|hitta|find you|strandvägen|showroom)/i,
            en: 'The showroom is at Strandvägen 7A, 114 56 Stockholm, open Monday–Saturday 9.00–18.00 (closed Sundays). The workshop is at Nybrogatan 34. Auditions are private, so please book ahead.',
            sv: 'Showroomet ligger på Strandvägen 7A, 114 56 Stockholm, öppet måndag–lördag 9.00–18.00 (stängt söndagar). Verkstaden finns på Nybrogatan 34. Visningar är privata, så boka gärna i förväg.',
            link: BOOK
        },
        {
            re: /(kontakt|contact|ring|call|phone|telefon|mail|e-?post|prata med|speak to|human|människa)/i,
            en: 'You can reach the atelier on +46 (0)8 555 0190 or atelier@larsresonance.com. For personal advice, leave your details in the contact form and a technician will call you back.',
            sv: 'Du når ateljén på 08-555 01 90 eller atelier@larsresonance.com. För personlig rådgivning, lämna dina uppgifter i kontaktformuläret så ringer en tekniker upp dig.',
            link: CONTACT
        },
        {
            re: /(tack|thanks|thank you|perfekt|toppen|great|wonderful|underbart)/i,
            en: 'The pleasure is ours. Is there anything else I can help you with?',
            sv: 'Nöjet är helt på vår sida. Finns det något mer jag kan hjälpa till med?'
        },
        {
            re: /(hej ?då|bye|goodbye|ha det|vi hörs|see you|farväl)/i,
            en: 'Thank you for visiting Lars Résonance. We look forward to welcoming you to the atelier.',
            sv: 'Tack för besöket hos Lars Résonance. Vi ser fram emot att välkomna dig till ateljén.'
        },
        {
            re: /(\bbot\b|\bai\b|robot|vem är du|who are you|är du en|are you a)/i,
            en: 'I am the atelier’s digital concierge. For anything personal — repertoire, room acoustics, a specific instrument — our technicians are happy to talk: +46 (0)8 555 0190.',
            sv: 'Jag är ateljéns digitala concierge. För allt personligt — repertoar, rumsakustik, ett specifikt instrument — pratar våra tekniker gärna med dig: 08-555 01 90.'
        },
        {
            re: /(^|\b)(hej|hallå|tjena|god ?(morgon|dag|kväll)|hello|hi|hey|good (morning|afternoon|evening))\b/i,
            en: 'Hello, and welcome to Lars Résonance. Are you looking for a piano, studio audio, or a complete room?',
            sv: 'Hej, och välkommen till Lars Résonance. Gäller det ett piano, studioljud eller ett helt rum?'
        }
    ];

    const FALLBACK = {
        en: 'Thank you — a technician will come back to you shortly. For an immediate answer, call +46 (0)8 555 0190 or write to atelier@larsresonance.com.',
        sv: 'Tack — en tekniker återkommer inom kort. För ett omedelbart svar, ring 08-555 01 90 eller skriv till atelier@larsresonance.com.'
    };

    function scripted(q) {
        for (const intent of INTENTS) {
            if (intent.re.test(q)) return { text: pick(intent), link: intent.link };
        }
        return { text: pick(FALLBACK), link: CONTACT };
    }

    applyLang();
}
