# État du MVP EmiID — audit et plan de présentation

> Audit du 2026-08-26, réalisé sur le code des trois applications.
> **Limite** : l'état réel de la base n'a pas pu être inspecté (MCP Supabase non
> disponible dans la session). Les points marqués « à vérifier en base » le
> restent.

---

## 1. `frontend-admin` — 7 pages, 39 actions serveur

| Page | État | Détail |
|------|------|--------|
| **Utilisateurs** | ✅ solide | recherche, filtres, export CSV, suspension, vérification, octroi Pro, déverrouillage PIN, fiche détaillée avec abonnement et paiements |
| **Modération** | ✅ solide | signalements, galerie, actions tracées |
| **Audit** | ✅ solide | journal des actions admin |
| **Annonces** | ✅ fonctionnel | diffusion in-app + campagnes e-mail |
| **Messages** | ✅ fonctionnel | litiges via le backend (`/api/messages/admin/*`) |
| **Paramètres** | ✅ fonctionnel | |
| **Tableau de bord** | 🟡 à enrichir | compteurs présents, **aucune vue des revenus** |

**Manque pour le MVP :** une vue **revenus** (abonnements actifs, boosts vendus,
transactions du mois). Les données existent déjà (`subscriptions`,
`payment_transactions`) — il n'y a pas d'écran pour les lire globalement.

---

## 2. `frontend-user` — 16 pages

| Domaine | État | Détail |
|---------|------|--------|
| **Annuaire + recherche** | ✅ solide | FTS français, classement pondéré, filtres, pays/tags réels |
| **Profil public** | ✅ solide | vitrine, portfolio, partage, QR/vCard, WhatsApp + appel, JSON-LD complet |
| **Messagerie** | ✅ solide | temps réel, pièces jointes |
| **Paramètres** | ✅ solide | 10 onglets, dont Abonnement et Boost |
| **Portefeuille** | ✅ réel | compétences, réalisations, communautés — vraies données |
| **Onboarding / création de profil** | ✅ | tunnel 3 étapes |
| **Notifications** | ✅ | temps réel, souscription partagée |
| **Abonnement Pro** | 🟡 **bloqué** | UI + paiement codés — **attend les clés FedaPay** |
| **Boosts** | 🟡 **bloqué** | idem, communal et départemental |
| **Recherche sémantique** | 🟡 optionnel | attend `GEMINI_API_KEY` — dégradation propre sur le FTS |
| **Assistant 0 résultat** | 🟡 optionnel | attend `GROQ_API_KEY` — bloc masqué sinon |
| **Hub public** | 🟠 à assumer | ticker et radar affichent des exemples **décoratifs** |

---

## 3. `backend` — 9 groupes de routes, 8 contrôleurs

| Domaine | État |
|---------|------|
| Authentification, profils, PIN, vérification | ✅ |
| Messagerie (+ modération) | ✅ |
| Tableau de bord, données publiques, référentiels | ✅ |
| E-mails admin (SMTP) | ✅ |
| **Paiements FedaPay** | ✅ codé — checkout, webhook signé, idempotent |
| Suspension appliquée à l'API | ✅ corrigé |
| **Tests** | 🟠 faible | 5 fichiers backend, 2 frontend |

**Cohérence vérifiée :** les 9 RPC appelées par le code sont toutes définies en
SQL, et toutes les tables référencées sont déclarées dans les types.

---

## 4. Ce qui bloque réellement une démonstration

| # | Blocage | Impact | Effort |
|---|---------|--------|--------|
| 1 | **Clés FedaPay absentes** | toute la monétisation est invisible : le checkout répond 502 | 15 min (ops) |
| 2 | **`NEXT_PUBLIC_GA_ID` non défini** | plus aucune mesure d'audience | 2 min (ops) |
| 3 | Pas de vue revenus côté admin | rien à montrer sur le modèle économique | ~2 h (dev) |
| 4 | Données décoratives du hub | crédibilité entamée si un visiteur creuse | ~1 h (dev) |

---

## 5. Plan proposé

### Étape 1 — Débloquer (ops, ~30 min, aucun code)
1. Render : `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET`,
   `FEDAPAY_BASE_URL` (sandbox) ; déclarer le webhook côté FedaPay.
2. Vercel `frontend-user` : `NEXT_PUBLIC_GA_ID`, `GROQ_API_KEY`,
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
3. Vérifier en base : `subscriptions`, `profile_boosts`, `communes` (77),
   et le nombre de profils rattachés à une commune.

### Étape 2 — Rendre la monétisation démontrable (~2 h)
- **Vue revenus** dans le tableau de bord admin : abonnements actifs, boosts en
  cours, transactions du mois, chiffre d'affaires cumulé.
- Un paiement sandbox de bout en bout, capturé pour la démonstration.

### Étape 3 — Crédibilité du hub public (~1 h)
- Brancher le ticker sur de vraies inscriptions récentes, **ou** retirer la
  mention « EN DIRECT » et assumer l'illustration.
- Même traitement pour le radar de proximité.

### Étape 4 — Confort de démonstration (~2 h)
- Jeu de données de démonstration : une quinzaine de profils crédibles répartis
  sur plusieurs communes, dont un Pro et un boosté — sans quoi l'annuaire, la
  recherche et le classement paraissent vides.
- Vérifier le parcours complet sur mobile.

### Étape 5 — Solidité (au-delà du MVP)
- Étendre les tests aux paiements et au classement de recherche.
- Planifier `expire_subscriptions()` et `expire_boosts()` (pg_cron).
- Phase 3 (B2B / NFC / ONG) uniquement sur demande réelle.

---

## 6. Ce qui est délibérément hors périmètre
- Boosts départementaux : livrés, mais à ne mettre en avant qu'après validation
  du communal.
- B2B Teams, badges NFC, offre ONG : structure pensée, non construite.
- Providers OAuth désactivés sur la page de connexion (badge « Bientôt »
  honnête, boutons réellement inactifs).
