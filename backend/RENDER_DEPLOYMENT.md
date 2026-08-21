# Guide de Deploiement Backend EmiID sur Render

> **@author**: @hopsyder
> **@organization**: Nexus Partners
>
> URL de production : **https://app-emiid.onrender.com**

---

## Vue d'ensemble

Le backend est un serveur Node/Express (TypeScript) deploye sur [Render](https://render.com)
en tant que **Web Service**. Deux options de configuration :

1. **Blueprint (recommande)** : le fichier `backend/render.yaml` decrit le service.
   Render lit ce fichier et cree/maintient le service automatiquement.
2. **Configuration manuelle** via le dashboard (voir plus bas).

Render definit automatiquement la variable `PORT` et place le service derriere un
proxy. Le code gere deja ces deux points (`process.env.PORT`, bind `0.0.0.0`,
`trust proxy`).

---

## Variables d'Environnement

**Variables OBLIGATOIRES :**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement d'execution | `production` |
| `SUPABASE_URL` | URL du projet Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Cle publique Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle de service Supabase (admin) | `eyJhbGciOi...` |
| `SUPABASE_JWT_SECRET` | Secret JWT (min 32 caracteres) | `your-jwt-secret-key...` |
| `CORS_ORIGIN` | URLs frontend autorisees (separees par virgules) | `https://app.emiid.com,https://admin.emiid.com` |

> **Note :** `PORT` est fournie automatiquement par Render — **ne pas la definir manuellement**.

**Variables OPTIONNELLES (mais recommandees) :**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `TRUST_PROXY` | Nombre de sauts de proxy (Render = 1) | `1` |
| `APP_URL` | URL publique de l'app (liens emails) | `https://app.emiid.com` |
| `WEBHOOK_SECRET` | Secret du webhook Supabase (`x-webhook-secret`) | `un-secret-fort` |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_SECURE` | Utiliser SSL/TLS | `false` |
| `SMTP_USER` | Utilisateur SMTP | `noreply@emiid.com` |
| `SMTP_PASS` | Mot de passe SMTP | `app-password` |
| `EMAIL_FROM` | Adresse expediteur | `"EmiID" <noreply@emiid.com>` |
| `VAPID_PUBLIC_KEY` | Cle publique VAPID (push) | `BL4a8...` |
| `VAPID_PRIVATE_KEY` | Cle privee VAPID | `DGv9X...` |
| `VAPID_SUBJECT` | Contact pour VAPID | `mailto:contact@emiid.com` |

---

## Option 1 : Deploiement via Blueprint (render.yaml)

1. Sur [render.com](https://render.com), cliquez sur **New +** > **Blueprint**.
2. Connectez le repo GitHub `Hop-Syder/app-emiid`.
3. Render detecte `backend/render.yaml` et propose la creation du service.
4. Renseignez les variables marquees `sync: false` (les secrets) dans le dashboard.
5. Cliquez sur **Apply** : le service se construit et se deploie.

Le blueprint definit deja :
- **Root Directory** : `backend`
- **Build Command** : `pnpm install --no-frozen-lockfile && pnpm run build`
- **Start Command** : `pnpm start`
- **Health Check Path** : `/health`

---

## Option 2 : Configuration Manuelle (Dashboard)

### Etape 1 : Creer le Web Service

1. **New +** > **Web Service**.
2. Connectez le repo `Hop-Syder/app-emiid`.
3. **Root Directory** : `backend`
4. **Runtime** : `Node`
5. **Build Command** : `pnpm install --no-frozen-lockfile && pnpm run build`
6. **Start Command** : `pnpm start`

### Etape 2 : Variables d'Environnement

Dans l'onglet **Environment**, ajoutez toutes les variables obligatoires (voir tableau plus haut).

### Etape 3 : Health Check

Dans **Settings** > **Health Check Path**, entrez `/health`.

### Etape 4 : CORS

Assurez-vous que `CORS_ORIGIN` contient les URLs de vos frontends de production
(pas de wildcard `*` en production).

---

## Verification du Deploiement

### 1. Test de Sante

```bash
curl https://app-emiid.onrender.com/
```

**Reponse attendue :**
```json
{
  "message": "EmiID Backend est operationnel !",
  "status": "ok"
}
```

### 2. Test de la Base de Donnees

```bash
curl https://app-emiid.onrender.com/health
```

**Reponse attendue :**
```json
{
  "status": "ok",
  "uptime_seconds": 123,
  "checks": {
    "database": {
      "status": "up",
      "response_time_ms": 45
    }
  }
}
```

---

## WebSockets & Plan Gratuit

- Le serveur supporte les **WebSockets** sur le meme port (heartbeat toutes les 30 s
  pour eviter les timeouts d'inactivite).
- Sur le **plan gratuit**, Render met le service en veille apres ~15 min d'inactivite ;
  la premiere requete suivante subit un « cold start » de quelques secondes. Passez a
  un plan payant pour un service toujours actif.

---

## Erreurs Courantes et Solutions

### Erreur : "Variable d'environnement obligatoire manquante: SUPABASE_URL"

**Cause :** Variable non configuree dans Render
**Solution :** Ajoutez toutes les variables obligatoires dans l'onglet **Environment**

### Erreur : "Configuration CORS invalide: wildcard interdit en production"

**Cause :** `CORS_ORIGIN=*` en production
**Solution :** Remplacez par les URLs specifiques de vos frontends

### Erreur : Build echoue

**Solutions :**
1. Verifiez que **Root Directory** est bien `backend`
2. Lancez `pnpm run build` localement pour identifier les erreurs TypeScript
3. Verifiez que toutes les dependances sont dans `package.json`

---

## Architecture de Deploiement

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │    │   Frontend   │    │   Backend    │  │
│  │  User        │    │   Admin      │    │   API        │  │
│  │  (Vercel)    │    │   (Vercel)   │    │   (Render)   │  │
│  │              │    │              │    │              │  │
│  │ app.emiid.com│    │admin.emiid.com   │app-emiid     │  │
│  │              │    │              │    │ .onrender.com│  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         └───────────────────┴───────────────────┘          │
│                             │                               │
│                    ┌────────▼────────┐                     │
│                    │    Supabase     │                     │
│                    │  (Database +    │                     │
│                    │   Auth)         │                     │
│                    └─────────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist Pre-Deploiement

- [ ] Toutes les variables d'environnement sont configurees dans Render
- [ ] `SUPABASE_URL` commence par `https://`
- [ ] `SUPABASE_JWT_SECRET` fait au moins 32 caracteres
- [ ] `CORS_ORIGIN` contient les URLs de production (pas de wildcard)
- [ ] `NODE_ENV` est defini sur `production`
- [ ] Le **Root Directory** est configure sur `backend`
- [ ] Build et Start commands sont corrects
- [ ] Health Check Path defini sur `/health`

---

## Support

En cas de probleme :
1. Verifiez les logs dans Render (onglet **Logs** du service)
2. Testez localement avec `pnpm run dev`
3. Contactez @hopsyder ou support@nexuspartners.xyz

---

## Dépannage : « Cannot find module dist/server.js »

Symptôme au démarrage :

```
Error: Cannot find module '/opt/render/project/src/backend/dist/server.js'
ELIFECYCLE  Command failed with exit code 1.
```

**Cause.** Le `buildCommand` du service ne compile pas TypeScript. Dans les logs,
la ligne de build affiche seulement :

```
==> Running build command 'pnpm install --no-frozen-lockfile'...
```

alors que ce blueprint prévoit `pnpm install --no-frozen-lockfile && pnpm run build`.
Autrement dit, **le service a été créé manuellement et n'utilise pas `render.yaml`** :
les valeurs du dashboard priment. Sans `pnpm run build`, `tsc` ne tourne jamais et
`dist/` n'existe pas.

**Correctifs.**

1. **Dashboard Render → Settings → Build Command** :
   ```
   pnpm install --no-frozen-lockfile && pnpm run build
   ```
   (ou reconnecter le service au Blueprint pour que `render.yaml` fasse foi).

2. **Filet de sécurité côté code** (déjà en place) : `npm start` exécute
   `scripts/ensure-build.js`, qui compile automatiquement si `dist/` est absent.
   Le service démarre donc même avec un `buildCommand` incomplet — mais le
   correctif 1 reste préférable (démarrage plus rapide, échec détecté au build).

## Dépannage : version de Node inattendue

Les logs affichaient `Using Node.js version 26.7.0` car `engines.node` valait
`>=20.0.0` — Render prenait alors la version la plus récente. La version est
désormais **épinglée sur la LTS 22** (`engines.node: "22.x"` et `NODE_VERSION=22`
dans `render.yaml`). Si le service n'utilise pas le blueprint, définir
`NODE_VERSION=22` manuellement dans l'onglet Environment.

## Branche déployée

Vérifier la branche suivie par le service (Settings → Branch) : les logs
indiquaient `Checking out commit … in branch main`. Si le développement se fait
sur une autre branche (`main-2`), le service déploie du code obsolète — aligner
la branche du service, ou reporter les commits sur la branche déployée.
