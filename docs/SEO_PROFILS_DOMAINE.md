# SEO des profils — domaine des pages publiques

> **Décision (Option A)** : les profils publics sont servis par l'**application**
> `app.emiid.com`. Le site officiel `emiid.com` **redirige** les anciens liens
> vers l'app. Un sous-domaine est parfaitement indexé par Google, et cela évite
> la fragilité d'un proxy cross-domaine (assets `/_next`, images locales du type
> `/badge/*`, `/api/proxy/*`, `/maintenance`, navigation client…).

## Architecture

```
Nouveau lien de partage / canonical / OG / JSON-LD
        └──►  https://app.emiid.com/profil/<slug>     (servi par frontend-user)

Ancien lien déjà partagé
   https://emiid.com/profil/<slug>
        └──► (redirection 308, frontend-commercial) ──► https://app.emiid.com/profil/<slug>
```

## Configuration requise

### Application — `frontend-user` (Vercel du projet app.emiid.com)

| Variable | Valeur | Rôle |
|----------|--------|------|
| `NEXT_PUBLIC_SITE_URL` | `https://app.emiid.com` | Domaine de l'app (canonical / OG / partage) |
| `NEXT_PUBLIC_PUBLIC_URL` | **⚠️ à SUPPRIMER** | Levier « domaine public » — laissé vide, tout retombe sur `app.emiid.com` |
| `ASSET_PREFIX` | **⚠️ à SUPPRIMER** | Préfixe d'assets multi-zones — inutile sans proxy |

> Le code retombe automatiquement sur `app.emiid.com` quand
> `NEXT_PUBLIC_PUBLIC_URL` n'est pas défini.

### Site officiel — `frontend-commercial` (Vercel du projet emiid.com)

| Variable | Valeur | Rôle |
|----------|--------|------|
| `APP_ORIGIN` | `https://app.emiid.com` | Cible de la redirection `/profil/*` |

La redirection est définie dans `frontend-commercial/next.config.mjs`.

## Étapes de mise en production

1. Sur `frontend-user` : **supprimer** `NEXT_PUBLIC_PUBLIC_URL` et `ASSET_PREFIX`, puis redéployer.
2. Sur `frontend-commercial` : déployer (contient la redirection) avec `APP_ORIGIN`.
3. Vérifier :
   - `https://app.emiid.com/profil/<slug>` → profil complet (images, badge, actions).
   - `https://emiid.com/profil/<slug>` → redirige (308) vers l'app.
4. Soumettre `https://app.emiid.com/sitemap.xml` à Google Search Console.

## Revenir plus tard à `emiid.com/profil` (si souhaité)

Ne pas re-proxifier via des rewrites de chemins (fragile). La bonne approche
serait d'**ajouter `emiid.com` comme domaine du projet `frontend-user`** (l'app
sert alors emiid.com directement) et de déplacer le site marketing sur un autre
domaine/route. C'est un changement d'architecture à part entière.
