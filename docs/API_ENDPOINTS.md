/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description API REFERENCE - Cartographie exhaustive des points d'entrée (endpoints) backend
 * @version 1.5.0
 * @updated 2026-08-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

# 📡 Points d'Entrée API (Backend) - EmiID Cockpit

Ce document recense de manière exhaustive les endpoints de l'API Express, leurs méthodes HTTP et leurs contrôleurs associés. Toutes les routes privées nécessitent un jeton d'authentification JWT Supabase valide.

---

## 💳 Paiements & Monétisation (`/api/payments`)
- `POST /api/payments/checkout` : Initialise une session de paiement FedaPay (Abonnement Pro ou Boost de profil) et retourne l'URL de paiement sécurisée.
- `GET /api/payments/status/:transactionId` : Vérifie et synchronise le statut d'une transaction de paiement.
- `POST /api/payments/webhook` : Point d'écoute webhook signé pour les notifications asynchrones de FedaPay (idempotent).
- `GET /api/payments/history` : Récupérer l'historique des transactions et factures de l'utilisateur connecté.

---

## 🔑 Authentification (`/api/auth`)
- `POST /api/auth/register` : Créer un nouvel utilisateur.
- `GET /api/auth/me` : Récupérer les informations d'authentification de l'utilisateur connecté (nécessite d'être authentifié).

---

## 👤 Utilisateurs & Profils (`/api/users`)
- `GET /api/users/me` : Récupérer le profil complet de l'utilisateur connecté.
- `PUT /api/users/me` : Mettre à jour les informations du profil connecté.
- `PUT /api/users/settings` : Mettre à jour les paramètres de l'utilisateur (notifications, langue, visibilité).
- `POST /api/users/account/deactivate` : Désactiver temporairement son compte.
- `DELETE /api/users/account` : Supprimer définitivement son compte.
- `POST /api/users/verify-pin` : Valider le code PIN de sécurité saisi.
- `POST /api/users/reset-pin` : Réinitialiser le code PIN utilisateur.

### Réseautage & Abonnements (Follows)
- `GET /api/users/follows` : Récupérer la liste des profils suivis par l'utilisateur.
- `GET /api/users/followers` : Récupérer la liste des abonnés de l'utilisateur.
- `POST /api/users/follow/:id` : Suivre ou ne plus suivre un profil spécifique par son ID.
- `PUT /api/users/follow/:id/note` : Ajouter ou modifier une note privée sur un profil suivi.

### Validation de Téléphone & SMS (CEDEAO)
- `POST /api/users/phone/request` : Demander l'envoi d'un SMS de validation de téléphone (OTP).
- `POST /api/users/phone/verify` : Soumettre le code reçu pour valider le numéro de téléphone.

### Administration des Utilisateurs
- `POST /api/users/:id/unlock-pin` : Déverrouiller le code PIN d'un utilisateur après blocage (réservé aux modérateurs/admins).

---

## 💬 Messagerie & Médiation (`/api/messages`)

### Fonctionnalités Utilisateurs
- `GET /api/messages/conversations` : Récupérer la liste des conversations actives (avec dernier message et compteur non lus).
- `GET /api/messages/conversation/:id` : Récupérer l'historique des messages d'une discussion spécifique.
- `DELETE /api/messages/conversation/:id` : Supprimer une conversation pour l'utilisateur.
- `POST /api/messages/send` : Envoyer un message texte simple dans une conversation.
- `POST /api/messages/upload/:conversationId` : Téléverser et envoyer une image/pièce jointe dans un chat (limite stricte à 10 Mo).
- `GET /api/messages/support` : Récupérer les informations de contact du service client de la plateforme.
- `POST /api/messages/dispute/:conversationId` : Signaler une discussion et demander une médiation de l'équipe de support.

### Cockpit d'Administration (Médiation)
- `GET /api/messages/admin/disputes` : Lister tous les dossiers de litige/médiation actifs (réservé aux admins).
- `POST /api/messages/admin/reply/:conversationId` : Publier un message système/direct dans le canal en cours de médiation.
- `POST /api/messages/admin/status/:conversationId` : Mettre à jour le statut du dossier de litige (ouvert, résolu, rejeté).
- `GET /api/messages/admin/conversation/:id` : Lire l'historique complet d'un chat faisant l'objet d'un litige.
- `POST /api/messages/admin/read/:conversationId` : Marquer les notifications de litige comme lues par le modérateur.

---

## 📊 Tableaux de Bord (`/api/dashboard` & `/api/public`)
- `GET /api/dashboard/stats` : Récupérer les indicateurs de performances internes de l'utilisateur (nombre de vues de profil, nouveaux abonnés, taux d'ouverture).
- `GET /api/public/stats` : Obtenir les statistiques publiques globales de la plateforme (total entrepreneurs inscrits, projets achevés, etc.) pour la Landing Page.

---

## 🌍 Données de Référence (`/api/reference`)
- `GET /api/reference/countries` : Récupérer la liste des pays (codes ISO, indicatifs téléphoniques, région d'Afrique de l'Ouest).
- `GET /api/reference/sectors` : Lister les grands domaines et secteurs d'activité de la plateforme.
- `GET /api/reference/professions` : Récupérer les professions détaillées liées aux secteurs d'activité.

---

## 🔗 Webhooks Supabase (`/api/webhooks`)
- `POST /api/webhooks/supabase` : Point d'écoute pour les événements asynchrones de Supabase (ex: synchronisation après modification directe dans le Dashboard Supabase).

---

## 👑 Administration Globale (`/api/admin`)
- `POST /api/admin/mailing` : Envoi d'un courriel (mailing) en masse à l'ensemble des utilisateurs (protégé par `requireAuth` + `requireAdmin`).

---

## 🎯 Moteur Missions Courtes & Séquestre (`/api/missions` & `/api/payments/escrow`)

### Endpoints Utilisateurs (Frontend Next.js App Router)
- `POST /api/missions/ai-refine` : Cadrage automatique et structuration d'un besoin informel en brief structuré via Google Gemini (`gemini-3.6-flash`).
- `POST /api/missions/apply` : Candidature atomique d'un prestataire à une mission (débit d'1 crédit, vérification du plafond strict de candidats et refus si complet).
- `POST /api/missions/select-applicant` : Sélection d'un prestataire par le client parmi les candidatures reçues (passage de la mission à `ASSIGNED`).
- `POST /api/missions/lifecycle` : Gestion des transitions du cycle de vie de la mission :
  - `START_WORK` : Démarrage des travaux par le prestataire (`IN_PROGRESS`).
  - `DELIVER` : Déclaration de livraison par le prestataire (`DELIVERED`), enclenchant la fenêtre de recette de 72h.
  - `COMPLETE` : Validation définitive du livrable par le client (`COMPLETED`) et libération des fonds séquestre.
  - `DISPUTE` : Ouverture formelle d'un litige motivé (`DISPUTED`) suspendant tout déblocage.

### Endpoints Séquestre & Paiements Backend (`/api/payments`)
- `POST /api/payments/checkout-escrow` : Initialise la consignation sécurisée des fonds de séquestre de mission via la passerelle FedaPay (MTN MoMo, Moov Money, Carte).
- `POST /api/payments/release-escrow` : Libération des fonds sous mandat vers le compte de reversement du prestataire.
- `POST /api/payments/refund-escrow` : Remboursement intégral des fonds consignés vers le client en cas d'annulation ou d'arbitrage favorable.
- `POST /api/payments/checkout-sourcing-express` : Paiement de la prestation B2B Sourcing Express (15 000 FCFA forfaitaire pour 3 profils vérifiés sous 24h).

### Console d'Arbitrage Administrateur (`/api/admin/missions`)
- `GET /api/admin/missions` : Récupère la file d'attente des litiges actifs, des séquestres sous mandat et des commandes de Sourcing Express.
- `POST /api/admin/missions` : Exécute une décision d'arbitrage :
  - `RESOLVE_DISPUTE` : Arbitrage en faveur du client (remboursement) ou du prestataire (paiement forcé).
  - `RECORD_STRIKE` : Consignation d'un strike d'intégrité pour manquement grave (avec répercussion sur le parrain).

---

## 🛡️ Middlewares Communs

L'API applique des validations uniformes sur les points d'entrée :
1.  **`requireAuth`** : Inspecte l'en-tête `Authorization` et valide le JWT Supabase.
2.  **`requireAdmin`** : Filtre les requêtes et rejette l'accès si l'utilisateur n'a pas le rôle admin dans ses métadonnées JWT.
3.  **`express-validator`** : Analyse syntaxique pour neutraliser les injections de scripts (XSS) et les injections de commandes.
4.  **`cors`** : Restriction d'accès exclusive aux noms de domaine configurés (app et cockpit).
