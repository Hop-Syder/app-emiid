# SEO des profils — servir `emiid.com/profil/slug` (multi-zones)

> Objectif : les profils publics sont indexés sous le **domaine officiel**
> `emiid.com` (marque, SEO), tout en restant **rendus par l'application**
> `app.emiid.com`. `app.emiid.com` reste l'application (espace connecté).

## Principe (Next.js Multi-Zones)

```
Visiteur / Googlebot
        │
        ▼
emiid.com/profil/aicha-bello      (site officiel = frontend-commercial)
        │  rewrite / reverse-proxy
        ▼
app.emiid.com/profil/aicha-bello  (rendu SSR = frontend-user)
```

- Le **canonical**, l'**OpenGraph**, le **JSON-LD** et le **lien de partage**
  pointent sur `emiid.com` → le SEO se consolide sur le domaine officiel.
- Les **assets** `/_next/static` de l'app sont chargés en absolu depuis
  `app.emiid.com` (via `ASSET_PREFIX`) → pas de collision avec les assets du
  site officiel.

## Variables d'environnement

### Application — `frontend-user` (Vercel du projet app.emiid.com)

| Variable | Valeur | Rôle |
|----------|--------|------|
| `NEXT_PUBLIC_PUBLIC_URL` | `https://www.emiid.com` | Domaine public pour canonical / OG / JSON-LD / lien de partage |
| `ASSET_PREFIX` | `https://app.emiid.com` | Charge les assets `/_next/static` depuis le domaine app quand les pages sont proxifiées |

> `NEXT_PUBLIC_SITE_URL` reste le domaine app (`https://app.emiid.com`) : il sert
> encore d'origine pour l'endpoint image OG (`/api/og/...`).

### Site officiel — `frontend-commercial` (Vercel du projet emiid.com)

| Variable | Valeur | Rôle |
|----------|--------|------|
| `APP_ORIGIN` | `https://app.emiid.com` | Cible des rewrites `/profil/*` et `/api/og/*` |

Le rewrite est défini dans `frontend-commercial/next.config.mjs`.

## Étapes de mise en production

1. Déployer `frontend-user` avec `NEXT_PUBLIC_PUBLIC_URL` et `ASSET_PREFIX`.
2. Déployer `frontend-commercial` (contient les rewrites) avec `APP_ORIGIN`.
3. Vérifier que `https://emiid.com/profil/<slug>` affiche bien le profil
   (HTML, styles, avatar, image OG).
4. Contrôler la balise canonical : elle doit indiquer
   `https://www.emiid.com/profil/<slug>` (View Source → `<link rel="canonical">`).
5. Soumettre le sitemap `https://www.emiid.com/sitemap.xml` à Google Search Console.

## Points de vigilance

- **Ne pas activer `NEXT_PUBLIC_PUBLIC_URL=emiid.com` avant** que le rewrite
  `frontend-commercial` soit en ligne : un canonical vers une URL qui renvoie 404
  déréférence la page (SEO cassé).
- L'endpoint `/_next/image` des pages proxifiées est servi par `emiid.com` :
  les domaines d'images (Supabase, etc.) sont donc déclarés dans
  `frontend-commercial/next.config.mjs > images.remotePatterns`.
- Tests à faire après déploiement (impossibles hors ligne) : navigation
  client-side sur la page proxifiée, chargement des polices et des images.
