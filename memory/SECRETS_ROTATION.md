# 🔐 Procédure de Rotation des Secrets — EmiID

> **À lire avant de commencer** : certaines rotations **déconnectent tous les utilisateurs** ou entraînent une **courte indisponibilité**. Planifie-les en heure creuse. Prépare la nouvelle valeur dans un gestionnaire de secrets (1Password, Bitwarden, Vault…) **avant** de supprimer l'ancienne.
>
> **Date de dernière rotation complète** : _à remplir après ton action_  
> **Date de la rotation VAPID automatisée** : 2026-01 (réalisée par l'agent E1)

---

## ✅ 1. VAPID (Push Notifications) — FAIT

**Nouvelle clé publique** : `BMPC1QLwG9URDZcU7xIi72QMiRqDLU7GGMmp49abHQwnS2GztOKg2kW5FHcOMhS9J9X4hJdoKgQZ7KZvZnPAYwo`  
**Nouvelle clé privée** : *(déjà mise à jour dans `/app/backend/.env` — ne jamais la copier ailleurs qu'un vault)*

### Actions encore à faire côté ton infrastructure

1. **Déployer la nouvelle `.env` backend** sur l'hébergeur de production (Railway, Vercel, VPS…).
2. **Créer/mettre à jour le `.env` des frontends** avec la clé publique :
   ```bash
   # /app/frontend-user/.env.local
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMPC1QLwG9URDZcU7xIi72QMiRqDLU7GGMmp49abHQwnS2GztOKg2kW5FHcOMhS9J9X4hJdoKgQZ7KZvZnPAYwo
   ```
3. **Redéployer frontend + backend**.
4. **Informer les utilisateurs** : les abonnements push existants sont invalidés → message in-app "Réactivez vos notifications".
5. *(Optionnel)* Purger la table `push_subscriptions` des anciens endpoints :
   ```sql
   DELETE FROM push_subscriptions WHERE created_at < '2026-01-01';
   ```

### Pour re-régénérer à l'avenir
```bash
cd /app/backend
npx web-push generate-vapid-keys
```

---

## 🔴 2. SUPABASE_SERVICE_ROLE_KEY — À FAIRE MANUELLEMENT

**Impact** : toutes les opérations admin backend échoueront pendant ~30 s (le temps du redeploy). RLS s'applique donc si tu as bien configuré tes policies, **aucune donnée n'est exposée** pendant la fenêtre.

### Procédure (5 min)

1. Aller sur https://supabase.com/dashboard/project/**orokyklztecsuvpbktwz**/settings/api
2. Dans la section **Project API keys**, localiser la ligne `service_role` (marquée "secret").
3. Cliquer sur **Reveal** puis **Reset service_role key** (un bouton "Regenerate" apparaît).
4. Confirmer la régénération → copier la **nouvelle** valeur dans ton gestionnaire de secrets.
5. Mettre à jour :
   - `/app/backend/.env` → `SUPABASE_SERVICE_ROLE_KEY=<nouvelle_valeur>`
   - `/app/frontend-admin/.env.local` → `SUPABASE_SERVICE_ROLE_KEY=<nouvelle_valeur>` (car `frontend-admin/lib/supabase/server.ts` l'utilise côté serveur dans `createAdminClient`)
6. Redéployer backend **puis** frontend-admin.
7. **Vérifier** : tenter une action admin (ex: lister les users dans le dashboard admin). Si 401/403 → vérifier la clé.

### Vérification rapide
```bash
curl -H "apikey: NOUVELLE_CLE" \
     -H "Authorization: Bearer NOUVELLE_CLE" \
     "https://orokyklztecsuvpbktwz.supabase.co/rest/v1/user_profiles?select=user_id&limit=1"
# Doit retourner un JSON, pas un 401.
```

---

## 🔴 3. SUPABASE_ANON_KEY — À FAIRE MANUELLEMENT

**Impact** : toutes les sessions utilisateur **sont déconnectées** (cookies invalidés). Préviens les utilisateurs 24 h à l'avance si possible.

### Procédure

1. Même page : https://supabase.com/dashboard/project/orokyklztecsuvpbktwz/settings/api
2. Cliquer **Reset anon public key**.
3. Copier la nouvelle valeur.
4. Mettre à jour dans **tous** ces fichiers (et les équivalents `.env.local` en prod) :
   - `/app/backend/.env` → `SUPABASE_ANON_KEY`
   - `/app/frontend-user/.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `/app/frontend-admin/.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Redéployer les 3 services **en même temps** (ou dans l'ordre backend → admin → user pour minimiser la fenêtre d'erreur).

---

## 🔴 4. SUPABASE_JWT_SECRET — À FAIRE MANUELLEMENT (⚠️ CRITIQUE)

**Impact** : **tous les tokens JWT émis deviennent invalides instantanément**. Tous les utilisateurs sont déconnectés et doivent se reconnecter. Les webhooks dépendant de Supabase Auth peuvent échouer brièvement.

### Procédure

1. Aller sur https://supabase.com/dashboard/project/orokyklztecsuvpbktwz/settings/auth
2. Section **JWT Settings** → **Generate a new secret**.
3. Confirmer (message rouge d'avertissement) → copier.
4. Mettre à jour `/app/backend/.env` : `SUPABASE_JWT_SECRET=<nouvelle_valeur>`.
5. Redéployer le backend.
6. Supabase invalide automatiquement les anciens JWT côté auth service — aucune action SQL requise.

### Avant de cliquer
- Communiquer aux utilisateurs : "Reconnexion obligatoire dans quelques minutes".
- S'assurer que le `remember me` n'est pas utilisé pour du stockage long terme côté client.

---

## 🔴 5. SMTP_PASS — À FAIRE MANUELLEMENT

**Impact** : les emails ne partiront plus tant que la nouvelle valeur n'est pas déployée. Pas de perte de données.

### Procédure (dépend de ton hébergeur mail, ici `mail.emiid.com`)

**Option A — cPanel / Webmin**
1. Se connecter à cPanel (`https://mail.emiid.com:2083` ou équivalent).
2. **Email Accounts** → ligne `no-reply@emiid.com` → **Manage** → **Change Password**.
3. Générer un mot de passe fort (≥ 20 caractères, sans `$`, `"`, `'` pour éviter l'interpolation shell/env).
4. Noter la nouvelle valeur.

**Option B — Panel Plesk / Directadmin** : menu Mail → Edit user → nouveau password.

**Option C — Serveur Postfix/Dovecot en direct** : `doveadm pw -s SHA512-CRYPT` + mise à jour `/etc/dovecot/users`.

### Mise à jour applicative
```bash
# /app/backend/.env
SMTP_PASS=<nouvelle_valeur>
```
Puis redéploiement backend + test d'envoi :
```bash
cd /app/backend
node -e "
  require('dotenv').config();
  require('./dist/services/mailService').sendEmail({
    to: 'daoudaabassichristian@gmail.com',
    subject: 'Test rotation SMTP',
    html: '<p>OK</p>'
  }).then(console.log).catch(console.error);
"
```

---

## 📋 Check-list globale post-rotation

Après avoir tourné **tous** les secrets, vérifie :

- [ ] `curl https://app.emiid.com/health` → `{"status":"ok"}`
- [ ] Connexion utilisateur OAuth (Google) fonctionne
- [ ] Envoi d'un message → email de notif reçu
- [ ] Dashboard admin affiche les users (teste `SERVICE_ROLE_KEY`)
- [ ] Push notif : souscrire + recevoir un push (teste VAPID)
- [ ] `git log --oneline -1` et `git status` — s'assurer qu'aucun `.env` n'est commité
- [ ] Archiver les **anciennes** valeurs dans ton vault avec date et raison de rotation

---

## 🧯 Si un déploiement casse après rotation

1. **Ne pas** revenir aux anciens secrets (ils sont désormais considérés compromis).
2. Vérifier l'ordre de déploiement : backend doit avoir la nouvelle clé **avant** que les frontends ne démarrent leurs requêtes.
3. Supabase peut mettre jusqu'à 60 s pour propager un reset d'API key — rafraîchir les logs après 1 min.
4. Pour l'anon key : invalider les cookies Supabase côté client en purgeant `supabase.auth.sb-*` dans `localStorage` (documenter côté UX).

---

## 🔄 Cadence recommandée

| Secret | Fréquence |
|---|---|
| VAPID | Tous les 12 mois ou après incident |
| `SERVICE_ROLE_KEY` | Tous les 6 mois + immédiatement si suspicion |
| `ANON_KEY` | Tous les 12 mois |
| `JWT_SECRET` | Tous les 6–12 mois (coût UX élevé) |
| `SMTP_PASS` | Tous les 3 mois |

---

## 🗝️ Où stocker la prochaine fois

**Ne plus jamais** déposer un `.env` avec des secrets de production sur un environnement partagé (preview, CI temporaire). Utiliser :
- **Doppler** / **Infisical** / **Vault** / **1Password Secrets Automation** → injection runtime uniquement.
- Variables d'env de l'hébergeur (Railway → Variables, Vercel → Environment Variables, Render → Environment).
- Jamais dans le code, jamais dans un bucket S3, jamais par email/Slack.
