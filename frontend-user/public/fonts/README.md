# Polices auto-hébergées — Charte EmiID

## Mitsuha (titres) — EN PLACE ✅

Fichiers actuellement chargés par le `@font-face` de `app/globals.css` :

| Fichier                  | Rôle                                             |
| ------------------------ | ------------------------------------------------ |
| `Mitsuha-Regular.woff2`  | Source principale (légère, servie en priorité)   |
| `Mitsuha-Regular.ttf`    | Repli si `.woff2` indisponible                   |

Une **seule graisse** est fournie ; le `@font-face` la déclare sur toute la plage
`font-weight: 100 900`, donc tous les titres (`<h1>`–`<h6>`, `font-heading`) l'utilisent
et le navigateur **synthétise le gras** au besoin. Satoshi reste en secours si le fichier
venait à manquer.

> Pour des graisses réelles (au lieu du gras synthétisé), ajouter des fichiers dédiés
> (`Mitsuha-Bold.woff2`, etc.) et un bloc `@font-face` par graisse.

## Inter (corps) & Satoshi (fallback titres)
Chargées via CDN (`@import` dans `globals.css`) — **rien à héberger ici**.
