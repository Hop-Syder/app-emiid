<!--
  @author @hopsyder
  @organization Nexus Partners
  @description Charte couleurs officielle EmiID — données extraites de la charte graphique du logo
  @updated 2026-08-18
  🌐 ceo.nexuspartners.xyz
  📧 daoudaabassichristian@gmail.com
-->

# Charte Couleurs — EmiID

> Source : charte graphique officielle du logo EmiID.
> Ces couleurs sont à utiliser **en priorité** pour le branding et peuvent servir
> de couleurs dominantes pour l'affichage grand format.

Le logotype officiel compte **3 couleurs principales** (Bleu, Cyan, Noir) et
**2 couleurs secondaires** (Blanc et le Dégradé).

---

## Couleurs principales

### 🔵 Bleu (roi) — Primaire

| Espace | Valeur |
|--------|--------|
| **HEX** | `#013FF4` |
| **RVB** | `1, 63, 244` |
| **CMJN** | `86, 73, 0, 0` |
| **HSL** | `225, 99%, 48%` |

Couleur principale de marque.

### 🩵 Cyan (bleu clair) — Secondaire

| Espace | Valeur |
|--------|--------|
| **HEX** | `#03B3F8` |
| **RVB** | `3, 179, 248` |
| **CMJN** | `67, 13, 0, 0` |
| **HSL** | `197, 98%, 49%` |

Accent et éléments secondaires. *(Libellé « Gris » sur la charte, mais il s'agit
d'un bleu clair / cyan.)*

### ⚫ Noir (bleu nuit)

| Espace | Valeur |
|--------|--------|
| **HEX** | `#000616` |
| **RVB** | `0, 6, 22` |
| **CMJN** | `81, 73, 60, 81` |
| **HSL** | `224, 100%, 4%` |

Fonds sombres et texte principal (mode clair).

---

## Couleurs secondaires

### ⚪ Blanc

| Espace | Valeur |
|--------|--------|
| **HEX** | `#FFFFFF` |
| **RVB** | `255, 255, 255` |

Fond clair par défaut, texte inversé.

### 🌈 Dégradé

| Propriété | Valeur |
|-----------|--------|
| **Composition** | Bleu roi (`#013FF4`) → Bleu nuit / marine (`#000616`) |
| **Style** | Linéaire |
| **Angle** | 45° |
| **Échelle** | 150% |

```css
/* Dégradé de fond de marque */
background: linear-gradient(45deg, #013FF4 0%, #000616 150%);

/* Variante texte (bleu roi → cyan) */
background: linear-gradient(45deg, #013FF4, #03B3F8);
```

---

## Mapping technique

### Variables CSS (rôles sémantiques)

| Rôle | Variable | Clair | Sombre |
|------|----------|-------|--------|
| Fond | `--background` | `#FFFFFF` | `#000616` |
| Texte | `--foreground` | `#000616` | `#EDEDED` |
| Primaire | `--primary` | `#013FF4` | `#3A6BFF` (éclairci) |
| Secondaire | `--secondary` | `#03B3F8` | `#03B3F8` |

### Hex bruts (toujours disponibles)

| Variable | Valeur |
|----------|--------|
| `--brand-blue` | `#013FF4` |
| `--brand-cyan` | `#03B3F8` |
| `--brand-navy` | `#000616` |
| `--brand-white` | `#FFFFFF` |

### Utilitaires Tailwind / classes

| Classe | Effet |
|--------|-------|
| `bg-primary` / `text-primary` | Bleu roi `#013FF4` |
| `bg-secondary` | Cyan `#03B3F8` |
| `bg-brand-blue` / `text-brand-navy` … | Couleurs de marque brutes |
| `.bg-brand-gradient` | Dégradé de fond 45° |
| `.text-brand-gradient` | Dégradé de texte (clip) |

---

## Où c'est appliqué

| App | Fichier | Système |
|-----|---------|---------|
| `frontend-user` | `app/globals.css` + `tailwind.config.ts` | Tailwind v3 (HSL, shadcn/ui) |
| `frontend-commercial` | `app/globals.css` | Tailwind v3 (hex) |
| `frontend-admin` | `app/globals.css` | Tailwind v4 (`@theme inline`) |

> Voir aussi `design-system/emiid/MASTER.md` pour les règles de composants,
> ombres, rayons et typographie associées à cette charte.
