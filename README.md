# Manhattan Miami Central

> A premium luxury real estate website inspired by [manhattanmiami.com](https://www.manhattanmiami.com/en/), built with modern web technologies and an emphasis on stunning visual design and interactivity.

---

## Preview

Open `index.html` in any modern browser. No build tools or server required — everything loads via CDN.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, Grid, Flexbox, animations, dark mode |
| **Vanilla JavaScript** | All interactivity without framework overhead |
| **GSAP 3.12** | ScrollTrigger animations, counters, reveals |
| **Swiper 11** | Touch-enabled sliders for neighborhoods & testimonials |
| **Lucide Icons** | Elegant SVG icon system |
| **Google Fonts** | Cormorant Garamond (display) + DM Sans (body) |

---

## File Structure

```
ManhattanMiamiCentral/
├── index.html          # Single-page site with all sections
├── css/
│   └── style.css       # Complete styling + dark mode + responsive
├── js/
│   └── main.js         # Animations, interactions, theme toggle
├── .gitignore
└── README.md
```

---

## Features

### Design & Visual

- **Luxury color palette** — Deep navy (#0A1628) base with gold (#C9A96E) accents and warm cream backgrounds
- **Premium typography** — Cormorant Garamond for elegant headlines, DM Sans for clean body text
- **Dark mode** — Full dark theme toggle with smooth transitions, persisted in localStorage
- **Custom cursor** — Gold dot with magnetic follower that reacts to interactive elements
- **Particle system** — Floating gold particles in the hero section

### Animations & Interactions

- **Preloader** — Animated loading bar with percentage counter
- **GSAP ScrollTrigger** — Elements gracefully reveal as you scroll into view
- **3D tilt effect** — Property cards tilt toward the cursor on hover
- **Magnetic buttons** — Buttons subtly attract toward the mouse cursor
- **Animated counters** — Statistics count up when scrolled into view
- **Hero slideshow** — Auto-rotating background images with Ken Burns zoom effect
- **Image reveals** — Clip-path animations for the about section images
- **Parallax scrolling** — Stats section background moves at a different scroll speed

### Sections

1. **Hero** — Full-viewport slideshow with animated text reveal and floating particles
2. **Marquee** — Auto-scrolling luxury property types banner
3. **About** — Split layout with image reveals, experience badge, and feature highlights
4. **Statistics** — Parallax background with animated counters ($4.2B+, 1500+ properties, etc.)
5. **Properties** — 6 luxury listings with filter system (All / Manhattan / Miami / Penthouses)
6. **Neighborhoods** — Touch-enabled Swiper slider showcasing 6 iconic locations
7. **Services** — 4 service cards with hover animations and gold accent bars
8. **Video CTA** — Full-width video background call-to-action
9. **Testimonials** — Auto-playing Swiper carousel with client reviews
10. **Contact** — Dual-column layout with floating form labels and gold focus animations
11. **Footer** — Multi-column links, social icons, and legal information

### Responsive Design

- Fully responsive from 480px mobile to 1400px+ desktop
- Mobile hamburger menu with staggered link animations
- Adaptive grid layouts (3 → 2 → 1 columns)
- Touch-optimized: custom cursor hidden on touch devices

---

## Dark Mode

Toggle between light and dark themes using the sun/moon button in the navigation bar.

- **Light theme**: Cream backgrounds, white cards, dark navy text
- **Dark theme**: Deep black backgrounds (#0D0D0D), dark cards, light text, enhanced gold accents
- Theme preference is saved to `localStorage` and persists across sessions
- Smooth 0.6s transition with a subtle flash animation on toggle

The theming system uses CSS custom properties (semantic tokens) that remap between themes, making it easy to add or modify theme variants.

---

## Color System

### Light Mode
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FAF8F5` (cream) | Page background |
| `--bg-secondary` | `#FFFFFF` | Section backgrounds |
| `--bg-card` | `#FFFFFF` | Card backgrounds |
| `--text-primary` | `#0A1628` (navy) | Headings, prices |
| `--text-body` | `#7A756E` | Body text |
| `--gold-accent` | `#B8963E` | Accent color |

### Dark Mode
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0D0D0D` | Page background |
| `--bg-secondary` | `#141414` | Section backgrounds |
| `--bg-card` | `#1A1A1A` | Card backgrounds |
| `--text-primary` | `#F0ECE6` | Headings, prices |
| `--text-body` | `#8A847C` | Body text |
| `--gold-accent` | `#D4AF37` | Accent color (brighter) |

---

## External Dependencies (CDN)

All external resources load via CDN — no installation needed:

- **GSAP** — `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/`
- **Swiper** — `cdn.jsdelivr.net/npm/swiper@11/`
- **Lucide Icons** — `unpkg.com/lucide@latest`
- **Google Fonts** — `fonts.googleapis.com`
- **Images** — `images.unsplash.com` (free stock photos)
- **Video** — `assets.mixkit.co` (free stock video)

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

---

## Performance Notes

- Images use `loading="lazy"` for deferred loading
- CSS transitions use `will-change` sparingly to avoid layer promotion overhead
- GSAP ScrollTrigger uses `once: true` to avoid re-triggering animations
- Hero particles are CSS-animated (no JS animation loop for particles)

---

## Customization

### Changing colors
Edit the CSS custom properties in `:root` (light) and `[data-theme="dark"]` blocks in `css/style.css`.

### Changing images
Replace the Unsplash URLs in `index.html` with your own image paths. Recommended sizes:
- Hero slides: 1920px wide
- Property cards: 800px wide
- Neighborhood cards: 800px wide
- About images: 800px and 600px wide

### Adding properties
Copy an existing `.property-card` block in the HTML and update the content. Add appropriate `data-category` attributes for the filter system.

---

## License

This project is for demonstration purposes. All images are sourced from [Unsplash](https://unsplash.com/) and video from [Mixkit](https://mixkit.co/) under their respective free licenses.
