# 🔒 Guide de Sécurité - Backend EmiID

**Date :** 26 mars 2026  
**Version :** 1.0.0  

---

## 📋 Checklist de Sécurité

### ✅ Avant chaque déploiement

#### 1. Variables d'Environnement
```bash
npm run validate-env
```

**Vérifications automatiques :**
- ✅ Présence de toutes les variables requises
- ✅ Longueurs minimales des secrets
- ✅ Absence de valeurs par défaut
- ✅ `.env` ignoré par Git

#### 2. Dépendances
```bash
npm audit
npm audit fix
```

**Fréquence recommandée :** Hebdomadaire

#### 3. Tests
```bash
npm test
npm run test:watch
```

**Couverture minimale requise :** 70%

---

## 🔐 Bonnes Pratiques Implémentées

### 1. Gestion des Secrets

**✅ Ce qui est en place :**
- Variables sensibles dans `.env` (jamais dans le code)
- `.env` listé dans `.gitignore`
- Template `.env.example` fourni
- Script de validation automatique

**❌ À NE PAS FAIRE :**
```bash
# JAMAIS commiter .env
git add .env  # ❌ INTERDIT

# JAMAIS exposer les clés en clair
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)  # ❌
```

**✅ BONNES PRATIQUES :**
```bash
# Utiliser .env.example comme template
cp .env.example .env
# Puis éditer avec vos vraies valeurs

# Vérifier avant de démarrer
npm run validate-env
npm run dev
```

### 2. Authentification & Autorisation

**Headers de sécurité (Helmet) :**
```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Configurer selon besoins
  crossOriginEmbedderPolicy: false
}));
```

**CORS configuré :**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://app.emiid.com',
  'https://app-nexus-connect-admin.vercel.app'
];
```

**Validation des tokens :**
- Tokens JWT requis pour routes protégées
- Expiration automatique
- Refresh token implémenté

### 3. Validation des Données

**Toutes les entrées utilisateur sont validées :**
- Email : format RFC 5322
- Password : min 8 caractères, majuscule, minuscule, chiffre, spécial
- Champs optionnels : null-safe
- Sanitization : XSS prevention

### 4. Logs & Monitoring

**Ce qui est loggué :**
- ✅ Erreurs serveur (avec stack traces)
- ✅ Requêtes suspectes (CORS, auth failures)
- ✅ Changements critiques (users, roles)

**Ce qui N'EST PAS loggué :**
- ❌ Mots de passe
- ❌ Tokens complets
- ❌ Données personnelles sensibles

---

## 🚨 Procédures d'Urgence

### Rotation des Clés Compromises

**Si une clé Supabase est exposée :**

1. **Immédiatement** révoquer dans Supabase Dashboard
2. Générer nouvelle clé
3. Mettre à jour `.env` local
4. Mettre à jour Railway/production
5. Redémarrer les services
6. Audit complet des logs

**Commandes :**
```bash
# 1. Révoquer ancienne clé (Supabase Dashboard)
# 2. Générer nouvelle clé
# 3. Update local
nano .env

# 4. Update production
railway variables set SUPABASE_SERVICE_ROLE_KEY=nouvelle_cle

# 5. Redémarrage
railway restart
```

### Fuite de Données

**Si données utilisateurs exposées :**

1. Identifier source de la fuite
2. Corriger la vulnérabilité
3. Notifier utilisateurs affectés
4. Documenter l'incident
5. Améliorer la sécurité

---

## 📊 Audit Trail

### Qui a accès à quoi ?

| Rôle | Accès DB | Logs | Production |
|------|----------|------|------------|
| Admin | ✅ Lecture/Écriture | ✅ Complet | ✅ Déploiement |
| Dev | ✅ Lecture seule | ✅ Errors uniquement | ❌ |
| Staging | ❌ | ❌ | ✅ Test uniquement |

### Révision Trimestrielle

**À faire tous les 3 mois :**
- [ ] Review des accès utilisateurs
- [ ] Audit des dépendances (`npm audit`)
- [ ] Rotation des secrets (si nécessaire)
- [ ] Mise à jour documentation
- [ ] Test de pénétration basique

---

## 🛡️ Sécurisation Continue

### Outils Recommandés

**1. Snyk (Vulnérabilités)**
```bash
npm install -g snyk
snyk test
snyk monitor
```

**2. ESLint Security**
```bash
npm install eslint-plugin-security
# Ajouter à .eslintrc.json
```

**3. Git Secrets (Pré-commit)**
```bash
# Installer pre-commit hooks
npm install husky --save-dev
npx husky install
```

### Intégration Continue

**GitHub Actions (exemple) :**
```yaml
name: Security Check

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security audit
        run: npm audit
      
      - name: Validate environment
        run: npm run validate-env
      
      - name: Run tests
        run: npm test
```

---

## 📚 Ressources

### Documentation Officielle
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Guidelines](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/database/security)

### Outils
- [Snyk Vulnerability Scanner](https://snyk.io/)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [ESLint Plugin Security](https://www.npmjs.com/package/eslint-plugin-security)

---

## ✅ Checklist Finale

Avant de considérer ce guide comme complet :

- [x] ✅ Audit NPM effectué et vulnérabilités corrigées
- [x] ✅ `.env` sécurisé et ignoré par Git
- [x] ✅ `.gitignore` backend créé
- [x] ✅ Script `validate-env` fonctionnel
- [x] ✅ Tests auth/messages/users créés
- [x] ✅ Documentation sécurité rédigée
- [ ] ⏳ Hooks pre-commit (à ajouter)
- [ ] ⏳ CI/CD security checks (à ajouter)
- [ ] ⏳ Rate limiting (à ajouter)
- [ ] ⏳ HTTPS enforcement (production uniquement)

---

**Contact Sécurité :** daoudaabassichristian@gmail.com  
**Dernière mise à jour :** 26 mars 2026

**Prochaine révision prévue :** 26 juin 2026
