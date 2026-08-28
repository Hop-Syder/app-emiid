# Mesure d'audience & référencement — `frontend-user`

## Ce qui fait vraiment remonter dans Google

Distinction utile : **Google Analytics ne fait pas remonter un site**. Il mesure.
Ce qui pèse sur le classement, c'est ce qui suit — et c'est là que l'effort a
porté :

| Levier | État |
|--------|------|
| `sitemap.xml` + `robots.txt` | ✅ existants |
| Métadonnées (canonical, OpenGraph, Twitter) | ✅ existantes |
| **Données structurées `Person` sur les profils** | ✅ **corrigées** (voir ci-dessous) |
| **Propriété Search Console** | ✅ ajoutée (jeton à renseigner) |
| Mesure GA4 | ✅ fiabilisée |

## Correction : les profils n'exposaient ni photo ni URL lisible

Le JSON-LD des vitrines déclarait `image: data.avatar_url` et
`url: …/profil/${data.slug}` — mais **ni `avatar_url` ni `slug` n'étaient
récupérés** par les requêtes de la page. Les deux valeurs étaient donc toujours
absentes : Google recevait une fiche `Person` **sans vignette**, et une URL
construite sur l'identifiant plutôt que sur le slug.

Les deux `select` récupèrent maintenant ces champs, et la fiche est enrichie
(`areaServed`, `addressCountry: BJ`, `memberOf: EmiID`).

## Search Console

Renseigner `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` avec le jeton fourni par
Google (méthode « balise HTML »), puis :

1. valider la propriété pour **`app.emiid.com`** ;
2. soumettre `https://app.emiid.com/sitemap.xml` ;
3. répéter pour **`emiid.com`** (site officiel).

Sans cette étape, aucune remontée d'indexation n'est visible et le sitemap n'est
pas déclaré — c'est le point le plus rentable de toute cette liste.

## Google Analytics 4

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_GA_ID` | Identifiant de mesure (`G-…`). **Absent ⇒ rien n'est chargé.** |

Deux défauts corrigés :

- l'identifiant était **codé en dur** dans `app/layout.tsx` — impossible de
  distinguer préproduction et production ;
- l'App Router navigue **sans recharger le document** : seule la première page
  était comptée. `components/analytics/google-analytics.tsx` émet désormais une
  vue à chaque changement de route (`send_page_view: false` côté `gtag` pour
  éviter le double comptage de la page d'entrée).

`useSearchParams()` impose une frontière `<Suspense>` : sans elle, Next bascule
toute l'application en rendu dynamique et le build échoue.

## Événements métier

`lib/analytics.ts` — à ne pas confondre avec `lib/track-profile.ts`, qui alimente
les compteurs internes affichés au professionnel :

| Fonction | Événement | Déclencheur |
|----------|-----------|-------------|
| `trackProfileView` | `view_profile` | consultation d'une vitrine |
| `trackProfileContact` | `contact_profile` | WhatsApp, appel, partage |
| `trackSearch` | `search` | recherche dans l'annuaire |

Les boutons WhatsApp / Appel et les partages émettent les deux mesures : le
compteur interne (visible par le professionnel) et l'événement GA4.
