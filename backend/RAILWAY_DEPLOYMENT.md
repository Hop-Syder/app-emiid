# Guide de Deploiement Backend EmiID sur Railway

> **@author**: @hopsyder  
> **@organization**: Nexus Partners

---

## Problemes Identifies et Solutions

### 1. Variables d'Environnement Manquantes (CRITIQUE)

Le backend necessite plusieurs variables d'environnement obligatoires. L'absence de ces variables provoque des erreurs au demarrage.

**Variables OBLIGATOIRES:**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur (Railway le definit automatiquement) | `5000` |
| `NODE_ENV` | Environnement d'execution | `production` |
| `SUPABASE_URL` | URL de votre projet Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Cle publique Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle de service Supabase (admin) | `eyJhbGciOi...` |
| `SUPABASE_JWT_SECRET` | Secret JWT pour validation (min 32 caracteres) | `your-jwt-secret-key...` |
| `CORS_ORIGINS` | URLs frontend autorisees (separees par virgules) | `https://app.emiid.com,https://admin.emiid.com` |

**Variables OPTIONNELLES (mais recommandees):**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `SMTP_HOST` | Serveur SMTP pour emails | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_SECURE` | Utiliser SSL/TLS | `false` |
| `SMTP_USER` | Utilisateur SMTP | `noreply@emiid.com` |
| `SMTP_PASS` | Mot de passe SMTP | `app-password` |
| `EMAIL_FROM` | Adresse expediteur | `"EmiID" <noreply@emiid.com>` |
| `VAPID_PUBLIC_KEY` | Cle publique VAPID (notifications push) | `BL4a8...` |
| `VAPID_PRIVATE_KEY` | Cle privee VAPID | `DGv9X...` |
| `VAPID_SUBJECT` | Contact pour VAPID | `mailto:contact@emiid.com` |
| `ADMIN_EMAILS` | Liste des emails admin (separees par virgules) | `admin@emiid.com,dev@emiid.com` |

---

### 2. Probleme d'Import dans `api/index.ts` (CRITIQUE)

Le fichier `backend/api/index.ts` utilise un import incorrect:

```typescript
// ERREUR ACTUELLE
import app from '../src/app';  // Ceci ne fonctionne pas en production

// CORRECTION NECESSAIRE
import { app } from '../src/app';  // Export nomme
```

**Solution:** Ce fichier est pour Vercel, pas Railway. Pour Railway, le point d'entree est `dist/server.js`.

---

### 3. Fichier `.env.example` Manquant

Le script `validate-env.js` attend un fichier `.env.example` qui n'existe pas dans le repo.

---

### 4. Configuration CORS en Production

En production, le wildcard `*` est interdit. Vous devez specifier explicitement les domaines autorises.

---

## Configuration Railway - Etape par Etape

### Etape 1: Creer un Nouveau Projet

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"**
3. Selectionnez **"Deploy from GitHub repo"**
4. Connectez votre compte GitHub si ce n'est pas fait
5. Selectionnez le repo `Hop-Syder/app-emiid`

### Etape 2: Configurer le Service

Apres avoir connecte le repo:

1. Cliquez sur le service cree
2. Allez dans l'onglet **Settings**
3. Dans **Root Directory**, entrez: `backend`
4. Dans **Build Command**, entrez: `npm run build`
5. Dans **Start Command**, entrez: `npm start`

### Etape 3: Configurer les Variables d'Environnement

1. Allez dans l'onglet **Variables**
2. Ajoutez TOUTES les variables suivantes:

```env
# === OBLIGATOIRES ===
NODE_ENV=production
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...votre_cle_service
SUPABASE_JWT_SECRET=votre_secret_jwt_minimum_32_caracteres

# === CORS - IMPORTANT ===
CORS_ORIGINS=https://app.emiid.com,https://admin.emiid.com

# === EMAIL (optionnel) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password
EMAIL_FROM="EmiID" <noreply@emiid.com>

# === NOTIFICATIONS PUSH (optionnel) ===
VAPID_PUBLIC_KEY=BL4a8...
VAPID_PRIVATE_KEY=DGv9X...
VAPID_SUBJECT=mailto:contact@emiid.com

# === ADMIN ===
ADMIN_EMAILS=admin@emiid.com
```

> **Note:** Railway definit automatiquement la variable `PORT`. Ne la definissez pas manuellement.

### Etape 4: Generer un Domaine Public

1. Allez dans **Settings** > **Networking**
2. Cliquez sur **"Generate Domain"**
3. Vous obtiendrez une URL comme: `emiid-backend-production.up.railway.app`

### Etape 5: Mettre a Jour CORS

Apres avoir obtenu votre domaine Railway, assurez-vous que:

1. La variable `CORS_ORIGINS` dans Railway contient vos URLs frontend
2. Vos frontends utilisent l'URL Railway pour les appels API

---

## Fichiers a Creer/Modifier

### Creer `.env.example` dans le dossier `backend/`

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Supabase (OBLIGATOIRE)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret_min_32_chars

# CORS - URLs frontend autorisees
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="EmiID" <noreply@emiid.com>

# Notifications Push (optionnel)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:contact@emiid.com

# Administration
ADMIN_EMAILS=admin@example.com
```

---

## Verification du Deploiement

Apres le deploiement, verifiez que tout fonctionne:

### 1. Test de Sante

```bash
curl https://votre-domaine.up.railway.app/
```

**Reponse attendue:**
```json
{
  "message": "EmiID Backend est operationnel !",
  "status": "ok",
  "port": 5000
}
```

### 2. Test de la Base de Donnees

```bash
curl https://votre-domaine.up.railway.app/health
```

**Reponse attendue:**
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

## Erreurs Courantes et Solutions

### Erreur: "Variable d'environnement obligatoire manquante: SUPABASE_URL"

**Cause:** Variable non configuree dans Railway  
**Solution:** Ajoutez toutes les variables obligatoires dans l'onglet Variables

### Erreur: "Configuration CORS invalide: wildcard interdit en production"

**Cause:** `CORS_ORIGINS=*` en production  
**Solution:** Remplacez par les URLs specifiques de vos frontends

### Erreur: "Cannot find module '../src/app'"

**Cause:** Mauvais point d'entree  
**Solution:** Verifiez que le Start Command est `npm start` (qui execute `node dist/server.js`)

### Erreur: "SUPABASE_URL doit commencer par https://"

**Cause:** URL mal formee  
**Solution:** Verifiez que votre `SUPABASE_URL` commence bien par `https://`

### Erreur: Build echoue

**Solutions:**
1. Verifiez que `Root Directory` est bien `backend`
2. Lancez `npm run build` localement pour identifier les erreurs TypeScript
3. Verifiez que toutes les dependances sont dans `package.json`

---

## Commandes Utiles pour Debug Local

```bash
# Installer les dependances
cd backend
npm install

# Valider les variables d'environnement
npm run validate-env

# Build du projet
npm run build

# Tester le build
npm start
```

---

## Architecture de Deploiement Recommandee

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Frontend    │    │   Frontend   │    │   Backend    │  │
│  │  User        │    │   Admin      │    │   API        │  │
│  │  (Vercel)    │    │   (Vercel)   │    │   (Railway)  │  │
│  │              │    │              │    │              │  │
│  │ app.emiid.com│    │admin.emiid.com    │ api.emiid.com│  │
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

- [ ] Toutes les variables d'environnement sont configurees dans Railway
- [ ] `SUPABASE_URL` commence par `https://`
- [ ] `SUPABASE_JWT_SECRET` fait au moins 32 caracteres
- [ ] `CORS_ORIGINS` contient les URLs de production (pas de wildcard)
- [ ] `NODE_ENV` est defini sur `production`
- [ ] Le `Root Directory` est configure sur `backend`
- [ ] Build et Start commands sont corrects
- [ ] Un domaine public est genere

---

## Support

En cas de probleme:
1. Verifiez les logs dans Railway (onglet Deployments > View Logs)
2. Testez localement avec `npm run dev`
3. Contactez @hopsyder ou support@nexuspartners.xyz
