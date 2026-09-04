# Lars Résonance — Pianos & High-End Audio Atelier

A premium single-page site for a (fictional) Stockholm atelier selling concert grands,
reference monitors, consoles and complete studio design. Static HTML/CSS/JS — no build step.

## Run locally

```bash
python3 -m http.server 4321
# → http://localhost:4321
```

Open `index.html` over HTTP (not `file://`) so fonts, fetch and localStorage behave normally.

## Structure

```
index.html            Page markup (English source). <head>: inline effects-tier script (pre-paint), modulepreloads
css/fonts.css         Self-hosted variable fonts (@font-face) — no Google Fonts requests
css/style.css         Design system in cascade layers: vendor (Swiper via @import) < base < components < tiers < utilities
js/app.js             Entry point (<script type="module">). Initialises every module, registers the service worker
js/data.js            ES module: instruments (EN + sv), currencies, i18n keyed map, chat/form endpoints
js/modules/env.js     Effects tier, feature detection, setPerf(), tiny helpers
js/modules/i18n.js    Key-based translation engine (data-i18n / -html / -aria / -placeholder) + t()
js/modules/theme.js   Light / dark
js/modules/ui.js      Toasts, modal scaffolding (focus trap, Escape, scroll lock)
js/modules/scroll.js  One rAF-batched scroll pipeline, Lenis (Premium), delegated anchor scrolling
js/modules/hero.js    Preloader (Premium), hero entrance, lazy slideshow, "Play a note"
js/modules/motion.js  Cursor ring, magnetic buttons, scroll reveals, counters, parallax
js/modules/collection.js  Cards, filters, currency, wishlist, recent, dossier (View Transitions), lightbox, search
js/modules/sliders.js Swiper carousels + footer deep links
js/modules/booking.js Audition calendar
js/modules/form.js    Contact form: validation, honeypot, status, optional backend
js/modules/ambient.js Weather / opening-hours bar, tab-away title
js/modules/settings.js Gear menu, mobile menu, segmented controls
js/modules/perf-probe.js Frame-rate probe → suggests one tier down
js/modules/chat.js    Concierge chat (scripted intents EN/SV; ready for an LLM backend)
sw.js                 Service worker (precache shell, stale-while-revalidate, Unsplash image cache)
fonts/                woff2 files (latin subset)
img/                  Icons, favicons, manifest images
privacy.html, terms.html
```

**The page must be served over http(s).** ES modules do not load from `file://`; the page then shows a notice
and renders without interactivity.

## Effects tiers

`<html data-perf="lite|standard|premium">` is set by the inline script in `<head>`:
a saved choice (`localStorage['lr-perf']`) wins, otherwise a quick device score
(cores, memory, GPU, pointer type, connection) picks a tier. `?perf=lite` in the URL
overrides and saves — handy for testing.

| Tier | What you get |
| --- | --- |
| Lite | No motion. Static hero, solid surfaces, everything visible immediately. |
| Standard (default) | Scroll reveals, counters, hero crossfade. No smooth-scroll, cursor, parallax or blur. |
| Premium | Everything: Lenis smooth scroll, cursor ring, magnetic buttons, Ken Burns hero, glass blur, preloader. |

Visitors change tier in the gear menu (desktop), the hamburger menu (mobile) or the footer.
If the page measures a low frame rate on first visit it politely suggests stepping one tier down.

## Translations

English is the source and lives in the markup. Every translatable element carries a key:
`data-i18n="collection.flagship"` (text), `data-i18n-html` (markup such as `<em>` or `<span data-eur>`),
`data-i18n-aria`, `data-i18n-placeholder`. Swedish is `DATA.i18n.sv.keyed[key]`; strings that live in
JS use `t(key)` → `DATA.i18n.sv.ui`. Instrument dossiers carry an `sv` block per instrument.
Changing an English sentence never breaks the translation — only the key matters.

## Contact form

Validates inline (blur), has a honeypot field, announces the result via `role="status"`.
Set `formEndpoint` in `js/data.js` (e.g. a Formspree URL) to actually send; until then submission is simulated.

## Service worker

`sw.js` precaches the shell and serves same-origin assets stale-while-revalidate, external images
cache-first (capped at 60). **Bump `CACHE_VERSION` on every release** or visitors keep old files.

## Concierge chat

`js/chat.js` answers from an intent table in both languages. To connect a real model,
set `chatEndpoint` in `js/data.js` to a backend URL; the widget POSTs
`{ lang, messages: [{role, content}] }` and expects `{ reply }`. Keep API keys on that server.

## Libraries (CDN, pinned, deferred)

GSAP 3.12 + ScrollTrigger · Swiper 11 · Lenis 1.1 · Lucide 0.469. Every library is
feature-detected in `main.js`, so the page still renders (without motion) if a CDN is blocked.
