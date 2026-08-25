# Protection anti-robot — Cloudflare Turnstile

## Répartition des deux clés

| Clé | Nature | Où elle va | Où elle ne va **jamais** |
|-----|--------|-----------|--------------------------|
| **Site key** | publique | code client (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) | — |
| **Secret key** | **secrète** | tableau de bord **Supabase** uniquement | ce dépôt, un fichier `.env` versionné, une variable `NEXT_PUBLIC_*` |

La site key identifie le widget dans le navigateur : elle est visible de tous,
et c'est normal. La secret key, elle, **valide** les jetons — quiconque la
détient peut fabriquer des validations.

> Une clé `NEXT_PUBLIC_*` est inscrite dans le bundle JavaScript au moment du
> build. Y placer la secret key reviendrait à la publier.

## Qui vérifie le jeton ?

**Supabase**, et personne d'autre dans ce projet. La protection est activée au
niveau du projet : à chaque `signInWithPassword`, Supabase appelle lui-même
`siteverify` chez Cloudflare avec la secret key. Le code applicatif se contente
de **produire** le jeton et de le **transmettre**.

C'est pourquoi aucune vérification `siteverify` ne figure dans le backend : elle
serait redondante.

```
navigateur ──(widget)──► Cloudflare ──► jeton
     │
     └─ signInWithPassword({ …, options: { captchaToken } })
              │
              └─► Supabase ──(secret key)──► siteverify ──► accepté / refusé
```

## Configuration

### 1. Supabase — la secret key
Authentication → Attack Protection → **Enable Captcha protection**
- Provider : **Turnstile**
- Secret key : celle du widget

Sans cette étape, Supabase refuse toute connexion par mot de passe avec
« captcha protection: request disallowed (no captcha_token found) ».

### 2. Cloudflare — les domaines autorisés
Le widget ne se charge que sur les domaines déclarés. Vérifier que **les deux**
y figurent :
- `app.emiid.com` (application)
- le domaine du back-office

Un domaine absent produit une erreur de chargement du widget, sans message
explicite côté application.

### 3. Vercel — la site key (facultatif)
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` sur les deux projets. En son absence, le code
retombe sur la clé du widget courant ; la variable sert à en changer sans
toucher au code.

## Où le widget est monté

| Application | Fichier | Méthode protégée |
|-------------|---------|------------------|
| `frontend-user` | `app/login/page.tsx` | OAuth (le jeton conditionne l'activation du bouton) |
| `frontend-admin` | `components/auth/admin-login-form.tsx` | `signInWithPassword` — jeton **transmis** |

La distinction compte : OAuth n'est pas soumis à la vérification captcha de
Supabase, contrairement à la connexion par mot de passe. Le back-office est donc
le seul endroit où le jeton doit réellement accompagner la requête.

## Un jeton ne sert qu'une fois

Après un échec de connexion, le jeton est invalidé : le formulaire admin le
remet à zéro et le widget en redemande un. Sans cela, la tentative suivante
serait refusée sans raison apparente.

## En cas de fuite

Une secret key exposée (capture, message, dépôt) doit être **régénérée** dans
Cloudflare, puis remplacée dans Supabase. La site key, elle, n'a pas à l'être.
