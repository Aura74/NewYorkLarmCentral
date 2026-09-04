# Kodanalys — Lars Résonance (SIDAN1)

*Genomgång 2026-09-04. Skriven som en senior frontend-utvecklare skulle skriva den: vad som är bra,
vad som drog ner prestandan, vad som gjordes nu och vad som återstår för att sidan ska kännas
helt premium och professionell.*

---

## 1. Varför sidan var seg

Det var inte en enskild sak utan sex effekter som alla körde samtidigt, hela tiden, oavsett dator:

| # | Orsak | Effekt på en svagare dator |
| --- | --- | --- |
| 1 | **Hero-bilden zoomade i 8 sekunder** (`transform: scale(1.1→1)` på en 1920 px fullskärmsbitmap) och startade om var 6:e sekund | GPU:n skalar om en helskärmsbild i princip konstant. Den enskilt största boven. |
| 2 | **`backdrop-filter: blur(20px)` på den fasta headern** samt blur på knappar och modaler | Blur måste räknas om för varje bildruta man scrollar. Dödar Intel-grafik och äldre Mac-datorer. |
| 3 | **Muspekar-ringen kördes i en evig `requestAnimationFrame`-loop** och flyttades med `left/top` (layout) i stället för `transform` | CPU-arbete 60 gånger i sekunden även när ingen rör musen. Kördes även i "Lite"-läget (bara gömd). |
| 4 | **Tre separata scroll-lyssnare** som läste `offsetTop` för alla sektioner och `scrollHeight` vid varje scroll-event | Tvingar webbläsaren att räkna om layouten flera gånger per scrollsteg ("layout thrash"). |
| 5 | **Lenis smooth scroll + GSAP-ticker** med `lagSmoothing(0)` | Hela sidan flyttas med JavaScript varje frame. Snyggt på en stark maskin, plågsamt på en svag. |
| 6 | **`background-attachment: fixed`** på statistik-sektionen | Stänger av GPU-komposition för elementet i många webbläsare, hela ytan ritas om vid scroll. |

Dessutom: **31 st `transition: all`** (animerar även padding, box-shadow, layout), **alla CDN-skript laddade blockerande i `<head>`** (GSAP ×3, Swiper, Lenis, Lucide via `unpkg@latest` som gör en långsam redirect), Google Fonts med 12 vikter, tre 1920 px hero-bilder som laddades direkt, en **bakgrundsvideo vars länk var död (HTTP 403)** och en preloader som la på slumpmässig fördröjning innan innehållet visades.

---

## 2. Vad som gjordes

### Effektnivå-väljare (Lite / Standard / Premium)
- Nivån sätts i ett **inline-skript i `<head>` före första utritningen** (inget flimmer). Sparat val vinner, annars poängsätts enheten (kärnor, minne, GPU via WebGL, pekartyp, uppkoppling). `?perf=lite` i adressen tvingar och sparar en nivå.
- **Lite:** ingen rörelse alls. Statisk hero, inga reveals, inga blur, inget scroll-progress, allt synligt direkt.
- **Standard (default):** scroll-reveals, räknare, hero-crossfade. Ingen Lenis, ingen pekar-ring, ingen parallax, inga blur.
- **Premium:** allt: Lenis, pekar-ring, magnetknappar, Ken Burns-zoom, glas-blur, preloader.
- Väljaren finns på tre ställen: kugghjulsmenyn (desktop), hamburgermenyn (mobil) och **footern**.
- Frame-rate-mätaren finns kvar men föreslår nu **ett steg ner** i stället för alltid Lite, körs bara om besökaren inte valt själv, och struntar i mätningen om fliken är dold.

### Prestanda
- Hero: bara första bilden laddas direkt (1600 px, förladdad med `fetchpriority=high`); bild 2–3 hämtas 1,5 s efter `load`. Zoomen är Premium-only.
- Alla `backdrop-filter` flyttade till Premium; Standard/Lite får solida ytor.
- Pekar-ringen: bara Premium + fin pekare, `transform`-baserad, rAF-loopen stannar när ringen kommit ikapp.
- **En** passiv scroll-lyssnare, arbetet samlas i en rAF, layoutmått mäts en gång och uppdateras via `ResizeObserver`. Headern har hysteres (på över 80 px, av under 30 px) så den inte fladdrar.
- `transition: all` ersatt med explicita egenskapslistor i alla 27 kvarvarande regler.
- `background-attachment: fixed` borttaget.
- Alla bibliotek `defer` och pinnade (Lenis via `npm/lenis@1.1.14`, Lucide `0.469.0` via jsdelivr). `ScrollToPlugin` borttaget (användes inte). `main.js` feature-detectar varje bibliotek, så sidan renderas (utan rörelse) även om ett CDN är blockerat.
- **Self-hostade variabla typsnitt** (4 filer, ca 170 kB): inga anrop till Google (GDPR/Schrems II), en fil per familj täcker alla vikter.
- Preloadern kopplad till riktiga `load`-eventet (min 0,5 s, max 1,4 s) och bara i Premium.
- `srcset`/`sizes`/`decoding=async` på 16 kortbilder; död video ersatt med lazy-laddad bild.
- Död CSS bortstädad (marquee, theme-toggle, intro-veil, perf-toggle, partiklar, reveal-utilities): ca 200 rader.

### Buggar som hittades och rättades
- **"Visit"-knappen i navigationen gjorde ingenting** (en `<button>` utan handler). Är nu en länk till kontaktformuläret.
- **Klick på logotypen eller någon `href="#"`-länk kastade ett JS-fel** (`document.querySelector('#')` är ogiltigt). Ankarhantering är nu delegerad och tålig.
- Blandat språk i svenskt läge: toasts, formulärstatus, ambient-raden, kalendern och effektbannern var hårdkodade på engelska. Nu översatta via `t()` + `i18n.sv.ui`. Annonsraden översätts, vädret beskrivs på svenska.
- Kvarleva i översättningarna från larmsidan ("Second Avg Response Time" → "År av hantverk") borttagen. "Work Email" → "Email Address".
- `<meta name="theme-color">` synkas nu vid temabyte (mobilens statusfält).
- Filterknappar använder `aria-pressed`; alla dekorativa ikoner har `aria-hidden`.
- README beskrev ett larmföretag. Nu beskriver den sajten.

### AI-chatt
- `js/chat.js` + markup + CSS enligt samma mönster som NyLarm/Bespoke: FAB nere till höger, widget med skrivindikator, snabbval, fokushantering, Escape stänger, respekterar Lite/reduced motion.
- **Tvåspråkig** (svar väljs efter aktivt språk, regexen matchar både svenska och engelska). Svar med länk ("Boka visning") scrollar till formuläret.
- Redo för riktig LLM: sätt `chatEndpoint` i `data.js` så POST:ar widgeten `{ lang, messages }` och väntar `{ reply }`. Nycklar hör hemma på servern.

---

## 3. Vad en senior utvecklare skulle säga

### Bra
- **Tokensystemet** (råfärger → semantiska variabler) gör mörkt/ljust tema nästan gratis. Chatten fick båda temana utan en rad extra CSS.
- Innehåll separerat från logik (`data.js`), inklusive översättningar.
- Modalerna har fokusfälla, Escape, `aria-modal`, återställning av fokus. Det är bättre än de flesta mallar.
- Många små "premium-signaler": ambient-rad med väder och öppettider, Web Audio-tonen, valuta, sparade instrument, nyligen visade, bokningskalender. Det känns genomtänkt.
- Typografin (Cormorant + DM Sans), guld-accenten och de symmetriska tag-linjerna ger rätt ton.

### Åtgärdat i andra passet (2026-09-04, senare samma dag)
- **Namngivning:** `.property-*` → `.piece-*`, `.neighborhood-*` → `.space-*`, sektionerna heter `#collection` och `#spaces`, temanyckeln `lr-theme` (gammal nyckel migreras).
- **i18n med nycklar överallt:** 271 `data-i18n*`-attribut, 232 svenska nycklar, svenska dossierer per instrument (`instruments[id].sv`). Textmatchningsmotorn är borttagen. En ändrad engelsk mening kan inte längre bryta översättningen.
- **Döda länkar:** alla 26 `href="#"` är borta. Footer-länkar filtrerar samlingen eller hoppar till rätt slide, "Learn more" förvaljer intresse i formuläret, "View the Full Catalogue" öppnar söklistan, sociala länkar pekar på (platshållar-)profiler.
- **Formulär:** inline-validering vid blur, honeypot, `role="status"` med fokus, `formEndpoint` i data.js (Formspree eller egen API) — simuleras tills en URL sätts.
- **ES-moduler:** main.js (1 250 rader) är nu `js/app.js` + 15 moduler i `js/modules/` med tydliga importer. Ingen byggkedja. Kräver http(s) — `file://` visar en notis.
- **View Transitions:** kortbilden morfar in i dossier-hero (`view-transition-name: piece-hero`), faller tillbaka till vanlig fade i Lite/reduced motion/äldre webbläsare.
- **CSS scroll-driven animations:** progress-baren och statistik-parallaxen körs på kompositor-tråden via `animation-timeline: scroll()/view()`; JS hoppar över sina versioner när stödet finns.
- **Service worker** (`sw.js`): precache av skalet, stale-while-revalidate, Unsplash-bilder cache-first med tak.
- **`@layer`:** `vendor < base < components < tiers < utilities`, Swiper importeras i vendor-lagret, **noll `!important`** kvar.

### Mindre bra (kvar att göra)
1. **Repo-namnet** är fortfarande `NewYorkLarmCentral` på GitHub. Byt namn på repot (GitHub gör redirect).
2. **Innehållet är placeholder** (Unsplash-bilder, påhittade recensenter, "40 år", sociala länkar till profiler som inte finns). Riktiga foton av riktiga instrument är det enskilt största lyftet för trovärdighet.
3. **`style.css` är fortfarande en fil på ~3 800 rader.** Lagren är på plats; nästa steg är att dela per komponent (`css/components/*.css`) och `@import … layer(components)`.
4. **Formuläret behöver en riktig mottagare** — sätt `formEndpoint`. Chatten behöver en backend om den ska vara mer än skriptad.
5. Ingen `sitemap.xml`/`robots.txt`, ingen `hreflang`, ingen Lighthouse i CI.

---

## 4. Vad som skulle göra den mer premium

- **Lugn i rörelsen.** Nu när Standard är default utan Lenis känns sidan snabbare, och snabbt = dyrt. Behåll få, långsamma, avsiktliga animationer. Premium-nivån är för visning, inte default.
- **Riktiga instrumentfoton med konsekvent ljussättning** i stället för blandade stock-bilder. Ett enda färgstick (varmt trä, mässing, mörk bakgrund) genom hela sidan.
- **Färre CTA-varianter.** Idag finns "The Collection", "Our Craft", "Play a note", "Visit", "Book a Private Audition", "Enquire", "Request a Private Audition". En primär handling (Boka visning) och en sekundär.
- **Typografisk hierarki:** låt rubrikerna andas (mer luft ovanför sektioner), minska antalet uppercase-etiketter med letter-spacing, som annars blir "brus".
- **Tystnad som stilmedel:** ta bort saker som pockar: "Scroll to listen", tab-away-titeln, slide-räknaren. En premium-sida behöver inte bevisa att den är interaktiv.
- **Case studies i stället för siffror.** "1 200 instrument intonerade" är abstrakt. Tre korta berättelser (konserthuset, masteringstudion, det privata hemmet) med bild, problem och resultat säljer bättre.
- **Prislogik:** "Price on Request" överallt gör att man känner sig utestängd. Ange "från"-priser där det går (som redan görs på några).

---

## 5. Vad som kan göras modernare (tekniskt) — kvar

Gjort: ES-moduler, View Transitions, scroll-driven animations, service worker, `@layer`, honeypot + validering.

- **`content-visibility: auto`** på sektioner under folden: webbläsaren hoppar över layout/paint av det som inte syns.
- **`<picture>` med AVIF/WebP** och egna bilder i `img/` i stället för Unsplash-URL:er (färre DNS-uppslag, fungerar offline, full kontroll).
- **Riktig formulär-/chatt-backend** (Formspree/Netlify Forms/egen endpoint); klienten är redo.
- **Lighthouse i CI** (GitHub Action) så prestandan inte regresserar när nya effekter läggs på.
- **Speculation Rules / prerender** av privacy/terms, `hreflang` + svensk URL, `sitemap.xml`.

---

## 6. Filer som ändrats

| Fil | Ändring |
| --- | --- |
| `index.html` | Inline tier-skript, OG/JSON-LD, self-hostade fonter, `defer` + pinnade CDN, lazy hero-bilder, död video → bild, trenivå-väljare ×3, chatt-markup, `srcset`, `aria-*`; **pass 2:** `.piece-*`/`.space-*`, 271 `data-i18n*`-nycklar, alla länkar riktiga, honeypot + felfält + status, `type="module"` + modulepreload, file://-notis |
| `css/style.css` | Tier-regler, blur → Premium, explicita transitions, död CSS borttagen, chatt-CSS, footer-väljare; **pass 2:** `@layer` (Swiper i vendor), noll `!important`, scroll-driven animations, view-transition-regler, formulär-/notis-stilar |
| `css/fonts.css`, `fonts/` | Nya: variabla woff2 (latin) för Cormorant Garamond + DM Sans |
| `js/app.js`, `js/modules/*.js` | **Nya:** main.js ersatt av 15 ES-moduler (env, i18n, theme, ui, scroll, hero, motion, collection, sliders, booking, form, ambient, settings, perf-probe, chat) |
| `js/data.js` | ES-modul; `chatEndpoint`, `formEndpoint`, 232 svenska nycklar, `ui`-strängar, vädertexter, svenska dossierer |
| `sw.js` | Ny: service worker |
| `README.md` | Beskriver nu rätt sajt och strukturen |

Testat i headless Chrome (puppeteer-core) på alla tre nivåer, desktop + mobil, ljust + mörkt tema: inga konsolfel, typsnitten laddas lokalt, inga anrop till Google Fonts eller unpkg, hero-bild 2–3 lazy-laddas, språkbytet slår igenom i chatt/ambient-rad/kalender, nivåbytet håller efter omladdning, chatten svarar på båda språken.
