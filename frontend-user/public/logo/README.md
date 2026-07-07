# Logo EmiID — variantes (Charte)

## Assets présents
| Fichier              | Nature                         | Usage actuel                                        |
| -------------------- | ------------------------------ | --------------------------------------------------- |
| `logo-emiid.png`     | Logo complet **couleur** (711×668, alpha) | Login, onboarding, preloader, intro          |
| `icon.svg`           | Icône (PNG embarqué dans un wrapper SVG, 2000×2000) | Sidebars desktop (auth + invité)   |
| `og-image.png`       | Bannière Open Graph 1200×630   | Métadonnées OG / Twitter                            |

## Favicons générés automatiquement (depuis `logo-emiid.png`)
`../icon-light-32x32.png`, `../icon-dark-32x32.png`, `../apple-icon.png`, `../icon.svg`
— créés via `sharp` pour réparer les références cassées de `app/layout.tsx`.

## ⚠️ Variantes charte à fournir (recommandé)
Le logo actuel est **raster couleur** : impossible à recolorer proprement. Pour une conformité
charte complète (lisibilité sur fonds sombres + déclinaisons), dépose idéalement :

| Fichier souhaité              | Description                                  | Remplace / améliore                     |
| ----------------------------- | -------------------------------------------- | --------------------------------------- |
| `logo-emiid-white.png` (ou svg) | Logo complet **monochrome blanc**          | Fonds sombres (sidebar auth, footer)    |
| `icon-white.svg`              | Icône **blanche** vectorielle                | `../icon-dark-32x32.png` (favicon dark) |
| `icon-color.svg`              | Icône **couleur** vectorielle (vrai vecteur) | `icon.svg` (actuellement raster lourd 160 K) |

- **`icon-dark-32x32.png`** est pour l'instant identique à la version couleur ; il devrait être
  la **variante blanche** pour bien ressortir sur les onglets en thème sombre.
- **`og-image.png`** gagnerait à refléter la nouvelle charte (bleu roi #013ff4 / cyan #03b3f8).

Dès qu'une variante vectorielle propre est fournie, on remplace `icon.svg` (160 K de raster) et on
allège fortement le poids des sidebars.
