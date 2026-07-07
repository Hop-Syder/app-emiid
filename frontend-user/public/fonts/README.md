# Polices auto-hébergées — Charte EmiID

## Mitsuha (titres)

Le `@font-face` de `app/globals.css` attend **exactement** ces fichiers dans ce dossier
(`frontend-user/public/fonts/`), au format **`.woff2`** :

| Fichier attendu           | Graisse mappée      | Usage                                   |
| ------------------------- | ------------------- | --------------------------------------- |
| `Mitsuha-Regular.woff2`   | 400                 | Titres légers / sous-titres             |
| `Mitsuha-Medium.woff2`    | 500–600             | Titres intermédiaires                   |
| `Mitsuha-Bold.woff2`      | 700–900 (`font-black`) | Gros titres / hero                   |

### Comment procéder
1. Convertir les fichiers Mitsuha reçus en `.woff2` (ex. via <https://cloudconvert.com/ttf-to-woff2>).
2. Les renommer **exactement** comme ci-dessus.
3. Les déposer dans ce dossier.

Aucun autre changement n'est nécessaire : dès que les fichiers sont présents,
les titres (`<h1>`–`<h6>` et `font-heading`) basculent automatiquement sur Mitsuha.
**Tant qu'ils sont absents, les titres retombent proprement sur Satoshi** (aucune casse visuelle).

> Si tu n'as qu'un seul fichier Mitsuha, dépose-le sous les trois noms (ou au minimum
> `Mitsuha-Regular.woff2`) : les autres graisses seront synthétisées par le navigateur.

## Inter (corps) & Satoshi (fallback titres)
Chargées via CDN (`@import` dans `globals.css`) — **rien à héberger ici**.
