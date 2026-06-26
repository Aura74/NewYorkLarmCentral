/* ============================================================
   LARS RÉSONANCE — content & data, separated from logic
   ============================================================ */
window.RESONANCE_DATA = {

  /* Weather + hours: Stockholm. Open-Meteo needs no API key. */
  location: {
    label: 'Stockholm',
    latitude: 59.33,
    longitude: 18.07,
    timeZone: 'Europe/Stockholm',
    openHour: 9,
    closeHour: 18,
  },

  /* Currency conversion, relative to EUR (approximate, display only) */
  baseCurrency: 'EUR',
  currencies: {
    EUR: { rate: 1,     symbol: '€',  position: 'before', locale: 'de-DE' },
    USD: { rate: 1.08,  symbol: '$',  position: 'before', locale: 'en-US' },
    GBP: { rate: 0.85,  symbol: '£',  position: 'before', locale: 'en-GB' },
    SEK: { rate: 11.3,  symbol: ' kr', position: 'after', locale: 'sv-SE' },
  },

  /* ---- Translations (English is the source; Swedish overrides) ---- */
  i18n: {
    sv: {
      keyed: {
        'nav.visit': 'Boka besök',
        'nav.search': 'Sök',
        'nav.saved': 'Sparat',
        'settings.title': 'Inställningar',
        'settings.language': 'Språk',
        'settings.currency': 'Valuta',
        'settings.theme': 'Tema',
        'settings.effects': 'Effekter',
        'settings.light': 'Ljust',
        'settings.dark': 'Mörkt',
        'settings.full': 'Full',
        'legal.privacy': 'Integritetspolicy',
        'legal.terms': 'Användarvillkor',
      },
      html: {
        'Sound, <em>Uncompromised</em>': 'Ljud, <em>kompromisslöst</em>',
        'Instruments, <em>Without</em> Equal': 'Instrument <em>utan</em> motstycke',
        'Heard In The <em>Finest</em> Rooms': 'Hörs i de <em>finaste</em> rummen',
        'Atelier <em>Services</em>': 'Ateljéns <em>tjänster</em>',
        'Hear The <em>Difference</em>': 'Hör <em>skillnaden</em>',
        'Trusted by <em>Artists</em>': 'Anlitas av <em>artister</em>',
        'Book a <em>Private</em> Audition': 'Boka en <em>privat</em> visning',
        'Years of<br>Craftsmanship': 'År av<br>hantverk',
        'Second Avg<br />Response Time': 'År av<br>hantverk',
      },
      text: {
        // Nav
        'Home': 'Hem', 'Atelier': 'Ateljén', 'Collection': 'Samlingen',
        'Services': 'Tjänster', 'Reviews': 'Omdömen', 'Contact': 'Kontakt', 'Spaces': 'Rum',
        // Hero
        'Where Sound': 'Där ljudet', 'Becomes': 'blir', 'Soul': 'själ',
        'Hand-selected concert grands and mastering-grade audio, voiced by master technicians. From the first key to the final mix — every detail tuned to perfection.':
          'Handplockade konsertflyglar och ljud i masteringklass, intonerat av mästartekniker. Från första tangenten till den sista mixen — varje detalj stämd till perfektion.',
        'The Collection': 'Samlingen', 'Our Craft': 'Vårt hantverk', 'Play a note': 'Spela en ton',
        // Makers / press
        'The Makers We Represent': 'Tillverkarna vi representerar',
        'As Featured In': 'Omskrivna i',
        'MusicTech Gold Award 2025': 'MusicTech Gold Award 2025',
        'Steinway Certified Atelier': 'Steinway-certifierad ateljé',
        '40 Years of Craftsmanship': '40 år av hantverk',
        // About
        'The Atelier': 'Ateljén',
        'Lars Résonance was founded on a single conviction: that an instrument and the room it lives in deserve the same obsessive care as the music itself. We curate concert grands and reference audio from the world’s finest makers — then make them sing.':
          'Lars Résonance grundades på en enda övertygelse: att ett instrument och rummet det lever i förtjänar samma omsorg som musiken själv. Vi väljer ut konsertflyglar och referensljud från världens främsta tillverkare — och får dem att sjunga.',
        'From a Steinway voiced by hand to a mastering suite tuned to the millimetre, our master technicians treat every project as a one-off commission. Nothing leaves the atelier until it sounds effortless.':
          'Från en handintonerad Steinway till en masteringstudio stämd på millimetern — våra mästartekniker behandlar varje projekt som ett unikt uppdrag. Inget lämnar ateljén förrän det låter självklart.',
        'Master Technicians': 'Mästartekniker',
        'Concert-level tuning, voicing and regulation by hand': 'Stämning, intonering och reglering för hand på konsertnivå',
        'World’s Finest Makers': 'Världens främsta tillverkare',
        'An exclusive curation of grands, consoles and reference audio': 'Ett exklusivt urval av flyglar, mixerbord och referensljud',
        'Book a Private Audition': 'Boka en privat visning',
        // Stats
        'Instruments Voiced': 'Intonerade instrument', 'Studios Designed': 'Designade studior',
        'Of Craftsmanship': 'Av hantverk', 'Master Technicians ': 'Mästartekniker',
        // Collection
        'A curated house of concert grands, reference monitors, consoles and studio instruments — each selected, voiced and delivered by hand.':
          'Ett kurerat hus av konsertflyglar, referensmonitorer, mixerbord och studioinstrument — vart och ett utvalt, intonerat och levererat för hand.',
        'Everything': 'Allt', 'Pianos & Keys': 'Pianon & klaviatur',
        'Studio & Audio': 'Studio & ljud', 'Atelier Services': 'Ateljétjänster',
        'View the Full Catalogue': 'Se hela katalogen',
        'Recently Viewed': 'Nyligen visade', 'Clear': 'Rensa',
        // Spaces
        'From concert halls to private residences, we craft the instrument and the acoustics to suit every space we touch.':
          'Från konserthus till privata hem — vi formar instrumentet och akustiken efter varje rum vi rör vid.',
        // Services
        'The Craft': 'Hantverket',
        'Bespoke Selection': 'Skräddarsytt urval',
        'Tuning & Voicing': 'Stämning & intonering',
        'Studio & Acoustics': 'Studio & akustik',
        'White-Glove Delivery': 'Leverans med silkesvantar',
        'Learn More': 'Läs mer',
        'Save': 'Spara', 'Saved': 'Sparat', 'Enquire': 'Förfrågan',
        // CTA
        'Whether it’s a single concert grand or a complete mastering suite, our atelier composes a setup tuned entirely to you — and delivers it ready to play.':
          'Oavsett om det är en enda konsertflygel eller en komplett masteringstudio komponerar ateljén en uppsättning helt anpassad efter dig — och levererar den spelklar.',
        // Testimonials
        'In Their Words': 'Med deras ord',
        'Concert Pianist': 'Konsertpianist', 'Mastering Engineer': 'Masteringtekniker',
        'Composer & Collector': 'Kompositör & samlare',
        // Contact
        'Get In Touch': 'Hör av dig',
        'Visit the atelier for a private audition, or invite us to your space. We’ll listen to what you need and propose an instrument or studio composed entirely for you — no obligation.':
          'Besök ateljén för en privat visning, eller bjud in oss till ditt rum. Vi lyssnar på vad du behöver och föreslår ett instrument eller en studio helt komponerad för dig — utan förpliktelse.',
        'Showroom': 'Showroom', 'Call Us': 'Ring oss', 'Email': 'E-post',
        'First Name': 'Förnamn', 'Last Name': 'Efternamn', 'Work Email': 'E-post',
        'Phone Number': 'Telefonnummer', 'I’m Interested In': 'Jag är intresserad av',
        'Tell Us About Your Project': 'Berätta om ditt projekt',
        'Request a Private Audition': 'Boka en privat visning',
        'Preferred date — private audition': 'Önskat datum — privat visning',
        'Choose a time': 'Välj en tid',
        // Footer
        'A bespoke atelier for concert grands and high-end audio. Sound, perfected by hand.':
          'En skräddarsydd ateljé för konsertflyglar och high-end-ljud. Ljud, fulländat för hand.',
        'Spaces': 'Rum', 'Company': 'Företag',
        '© 2026 Lars Résonance Atelier. All rights reserved.': '© 2026 Lars Résonance Atelier. Alla rättigheter förbehållna.',
        // Announce base
        'Private auditions by appointment — Strandvägen 7A, Stockholm':
          'Privata visningar efter överenskommelse — Strandvägen 7A, Stockholm',
      },
    },
  },

  /* Per-instrument dossiers, keyed by the card's data-id */
  instruments: {
    'konzert-grand': {
      kicker: 'Concert Grand',
      title: 'Konzert Grand 280',
      price: 'Price on Request',
      summary: 'Our flagship concert grand — a 280 cm instrument with a hand-built spruce soundboard, voiced note by note for the world’s great stages. The action is regulated for the lightest possible touch without losing a gram of control.',
      specs: [
        { label: 'Length', value: '280 cm' },
        { label: 'Soundboard', value: 'Solid Alpine spruce' },
        { label: 'Action', value: 'Hand-regulated, concert-grade' },
        { label: 'Finish', value: 'Hand-polished ebony' },
        { label: 'Voicing', value: 'Bespoke, by appointment' },
      ],
      provenance: 'Each grand is selected at the maker’s atelier, then voiced and regulated in our Stockholm workshop over a period of six weeks before delivery.',
      gallery: [
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0',
        'https://images.unsplash.com/photo-1552422535-c45813c61732',
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf',
      ],
    },
    'reference-monitors': {
      kicker: 'Main Monitors + Power Amp',
      title: 'Référence Monitor System',
      price: 'From <span data-eur="36500">€36,500</span> / pair',
      summary: 'A three-way reference monitoring system paired with a dedicated Class-A power amplifier. Engineered for the final word in a mix — flat, fast and utterly revealing from 20 Hz to 40 kHz.',
      specs: [
        { label: 'Configuration', value: '3-way active' },
        { label: 'Amplifier', value: 'Dedicated Class-A' },
        { label: 'Response', value: '20 Hz – 40 kHz' },
        { label: 'Cabinet', value: 'CNC-milled hardwood' },
        { label: 'Calibration', value: 'Room-tuned on site' },
      ],
      provenance: 'Supplied as a calibrated pair and tuned to your room’s acoustics during installation.',
      gallery: [
        'https://images.unsplash.com/photo-1470019693664-1d202d2c0907',
        'https://images.unsplash.com/photo-1466428996289-fb355538da1b',
        'https://images.unsplash.com/photo-1607968565043-36af90dde238',
      ],
    },
    'studio-design': {
      kicker: 'Turnkey Studio Build',
      title: 'Bespoke Studio Design',
      price: 'Commission Only',
      summary: 'A complete, turnkey studio — room acoustics, treatment, monitoring, console and wiring, designed and built around the way you work. We engineer a space where every decision you make on the mix is the right one.',
      specs: [
        { label: 'Scope', value: 'Acoustics → wiring' },
        { label: 'Treatment', value: 'Bespoke diffusion & absorption' },
        { label: 'Monitoring', value: 'Calibrated to room' },
        { label: 'Timeline', value: 'Typically 12–20 weeks' },
        { label: 'Aftercare', value: 'Lifetime support' },
      ],
      provenance: 'Delivered as a single commission, from first acoustic survey to final voicing in the finished room.',
      gallery: [
        'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f',
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
        'https://images.unsplash.com/photo-1605020420620-20c943cc4669',
      ],
    },
    'synth-collection': {
      kicker: 'Synths & Keyboards',
      title: 'Analogue Synth Collection',
      price: 'From <span data-eur="4200">€4,200</span>',
      summary: 'A curated collection of analogue synthesizers and weighted keyboards — from iconic polyphonic classics to modern 88-key controllers. Each unit is serviced, calibrated and ready to perform.',
      specs: [
        { label: 'Type', value: 'Analogue & hybrid' },
        { label: 'Keys', value: 'Up to 88, weighted' },
        { label: 'Voices', value: 'Mono to fully polyphonic' },
        { label: 'Service', value: 'Calibrated & warrantied' },
      ],
      provenance: 'Sourced and restored in-house; every instrument is bench-tested before it leaves the atelier.',
      gallery: [
        'https://images.unsplash.com/photo-1535992165812-68d1861aa71e',
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625',
        'https://images.unsplash.com/photo-1574169208507-84376144848b',
      ],
    },
    'mixing-console': {
      kicker: 'Mixing & Mastering Console',
      title: 'Analogue Mixing Console',
      price: 'By Appointment',
      summary: 'A hand-built 48-channel analogue console with discrete signal path and total recall. The centrepiece of a serious room — warmth and headroom in equal measure, built to outlast the records made on it.',
      specs: [
        { label: 'Channels', value: '48' },
        { label: 'Signal path', value: 'Fully discrete' },
        { label: 'Recall', value: 'Total, motorised' },
        { label: 'Build', value: 'Hand-assembled' },
        { label: 'Lead time', value: 'Made to order' },
      ],
      provenance: 'Built to order and commissioned on site, with full calibration and operator training included.',
      gallery: [
        'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
        'https://images.unsplash.com/photo-1571327073757-71d13c24de30',
      ],
    },
    'tube-mic': {
      kicker: 'Tube Microphone',
      title: 'Vintage Tube Microphone',
      price: 'From <span data-eur="9800">€9,800</span>',
      summary: 'A hand-made large-diaphragm tube microphone in the great tradition — silky top end, rich body and a presence that has defined records for seventy years. Supplied with a matched power supply and bespoke shockmount.',
      specs: [
        { label: 'Capsule', value: 'Large-diaphragm' },
        { label: 'Pattern', value: 'Cardioid (multi-pattern available)' },
        { label: 'Valve', value: 'Hand-selected tube' },
        { label: 'Includes', value: 'PSU, shockmount, case' },
      ],
      provenance: 'Each microphone is hand-built and individually tested against a reference before shipping.',
      gallery: [
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc',
        'https://images.unsplash.com/photo-1558098329-a11cff621064',
        'https://images.unsplash.com/photo-1545167622-3a6ac756afa4',
      ],
    },
  },
};
