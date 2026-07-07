/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Design System Master File pour EmiID (Version Bleue/Cyan)
 * @created 2026-02-22
 * @updated 2026-07-07
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
 ──────────────────────────────────

# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** EmiID
**Category:** Luxury/Premium Brand (Luxury Bento & Glassmorphism)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable | Description |
|------|-----|--------------|-------------|
| Primary / Brand Blue | `#013ff4` | `--brand-blue` / `--primary` | Bleu roi, couleur principale de marque |
| Secondary / Brand Cyan | `#03b3f8` | `--brand-cyan` / `--secondary` | Bleu clair, accent et éléments secondaires |
| Dark / Brand Navy | `#000616` | `--brand-navy` / `--background` (dark) | Bleu nuit, couleur sombre et arrière-plan |
| Background (Light) | `#FFFFFF` | `--background` (light) | Fond clair par défaut |
| Text (Light Mode) | `#000616` | `--foreground` (light) | Texte principal en mode clair |
| Text (Dark Mode) | `#ededed` | `--foreground` (dark) | Texte principal en mode sombre |

**Color Notes:**
- **Brand Gradients:** 
  - Background: `linear-gradient(45deg, #013ff4 0%, #000616 150%)` (`.bg-brand-gradient`)
  - Text: `linear-gradient(45deg, #013ff4, #03b3f8)` (`.text-brand-gradient`)

### Typography

- **Heading Font:** Mitsuha (secours: Satoshi)
- **Body Font:** Inter
- **Mood:** premium, luxury bento, clean, sophisticated, versatile, balanced, high-contrast
- **Fonts Loading:** 
  - **Mitsuha:** Auto-hébergée dans `@/public/fonts/`
  - **Inter:** Google Fonts / Next.js font loader
  - **Satoshi:** Secours titres (CDN Fontshare)

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.15)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.2)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button (EmiID Blue) */
.btn-primary {
  background: #013ff4;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0033c4;
  transform: translateY(-1px);
}

/* Secondary Button (EmiID Blue Outline) */
.btn-secondary {
  background: transparent;
  color: #013ff4;
  border: 2px solid #013ff4;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(1, 63, 244, 0.05);
  border-color: #03b3f8;
  color: #03b3f8;
}
```

### Cards (Glassmorphism & Bento)

```css
.card {
  background: var(--background);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
  backdrop-filter: blur(12px);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: rgba(1, 63, 244, 0.3);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #013ff4;
  outline: none;
  box-shadow: 0 0 0 3px rgba(1, 63, 244, 0.15);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 6, 22, 0.6);
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--background);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Luxury Bento & Glassmorphism

**Keywords:** Glassmorphism, grid bento, translucent borders, smooth transitions, backdrop-filter, dark/light contrast, custom color-accent icons, responsive alignment, modern depth.

**Key Effects:** Bento grid widgets (5 columns layout), subtle glowing border gradients, dynamic backdrop blur, smooth card hover transforms.

### Page Pattern

**Pattern Name:** Marketplace / Directory

- **Conversion Strategy:** map hover pins, card carousel, Search bar (Cmd+K palette) is the primary CTA. Reduce friction to search. Popular searches suggestions.
- **CTA Placement:** Hero Command Palette (Cmd+K) + Navbar actions.
- **Section Order:** 1. Hero (Cmd+K Search focused), 2. Communities/Spotlight Carousels, 3. Categories Explorer, 4. Network grid/Bento, 5. Premium CTA (Join the network)

---

## Anti-Patterns (Do NOT Use)

- ❌ Cheap visuals or standard CSS styles
- ❌ Fast or abrupt animations (always transition 150-300ms)
- ❌ Hard dark backgrounds that aren't Blue Nuit (`#000616`)
- ❌ Purple / Green as primary branding accents (now reserved for minor semantic roles)

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Streamline color icons or Heroicons/Lucide)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift adjacent layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for accessibility (a11y)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG or custom asset icons instead)
- [ ] All icons conform to the Streamline / SVG system
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars or MobileDock
- [ ] No horizontal scroll on mobile (except native snap carousels)

