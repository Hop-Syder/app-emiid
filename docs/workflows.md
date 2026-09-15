# EmiID — Parcours et workflows du produit

> Document de référence technique : décrit, pour chaque parcours utilisateur
> réellement implémenté, la séquence logique des étapes, les acteurs, les
> fichiers/fonctions responsables et les garde-fous (RLS/triggers) associés.
> Complète [`contexte-strategique.md`](contexte-strategique.md) (le pourquoi)
> et [`architecture-supabase.md`](architecture-supabase.md) (le schéma) par
> le comment concret du code actuel.

## 1. Inscription & connexion

EmiID n'a pas de flux d'inscription distinct : la première connexion crée le
compte (`src/app/(auth)/register/page.tsx` redirige simplement vers
`/login`).

1. L'utilisateur clique "Continuer avec Google/LinkedIn/Apple"
   (`OAuthButtons.tsx` → `useAuth().signInWithOAuth`).
2. Redirection vers le provider, puis retour sur `/auth/callback`.
3. Trigger Postgres `handle_new_user()` (`20260910120002_profiles.sql`) :
   crée automatiquement `profiles` (rôle `client` par défaut) +
   `profile_private` (email), en normalisant les métadonnées qui diffèrent
   selon le provider.
4. L'utilisateur arrive sur `/dashboard` en tant que **client**.

Aucun mot de passe, aucun OTP téléphone/WhatsApp — uniquement OAuth
aujourd'hui (l'audit précédent notait que le dossier stratégique mentionne
un OTP mobile qui n'existe pas dans le code).

## 2. Annuaire & recherche ("je cherche un professionnel")

1. `/coachs` (`src/app/coachs/page.tsx`) appelle la RPC
   `search_professionals` (géolocalisation PostGIS, catégorie, spécialité,
   texte libre, niveau de vérification minimum) — filtrage/tri
   entièrement côté base, le front ne compose jamais de requête spatiale.
2. `CoachDirectory.tsx` + `FilterSidebar.tsx` gèrent le filtrage interactif
   côté client (relance la RPC à chaque changement de filtre).
3. Clic sur un profil → `/coachs/[id]` : détail public (offres, avis,
   niveau de vérification, disponibilités) — RLS `professional_profiles_select`
   n'expose que les profils `is_published = true` (sauf au propriétaire/admin).
4. Depuis là : réservation d'une offre (§5) ou publication d'une mission
   ciblée.

## 3. Devenir professionnel (parrainage)

Seule voie pour passer `client → professional` (avec l'admin) — imposée par
le trigger `enforce_role_change` (`20260910120002_profiles.sql`).

1. `/devenir-pro` (`devenir-pro/page.tsx`) : le client choisit un parrain
   parmi les professionnels déjà publiés de la catégorie visée (aujourd'hui
   uniquement "coach").
2. `RequestSponsorshipForm.tsx` → RPC `request_sponsorship` — vérifie que le
   demandeur est bien `client` et que le parrain est publié dans la bonne
   catégorie. Crée une ligne `sponsorships` en `pending` (un seul
   parrainage actif/pending à la fois par filleul).
3. Le parrain voit la demande sur `/parrainages`
   (`SponsorshipRequestCard.tsx`) et approuve ou refuse.
4. RPC `approve_sponsorship` : bascule `sponsorships.status = 'active'`,
   `profiles.role = 'professional'`, crée `professional_profiles` (non
   publié). RPC `reject_sponsorship` sinon.
5. Notification au filleul (`sponsorship_approved`/`sponsorship_rejected`).

*Écart connu (voir audit précédent) : la règle "2 avertissements max +
dégradation de l'indice du parrain" décrite dans le dossier stratégique
n'est pas encore implémentée (Phase 2 du plan d'exécution, non commencée).*

## 4. Profil professionnel & badge de confiance

1. `/profil-professionnel` (redirige vers `/devenir-pro` si le rôle n'est
   pas `professional`/`admin`) :
   - `ProfessionalProfileForm.tsx` : headline, expérience, langues, spécialités.
   - `OffersManager.tsx` : création/édition des offres (session/pack/atelier/programme), prix, durée.
   - `VerificationSubmitForm.tsx` : dépôt de preuves (`identity`, `document`,
     `certification`, `reference`, `service_history`) avec upload vers le
     bucket Storage `verification-documents`.
2. Le pro publie son profil (`is_published = true`) quand il est prêt à
   apparaître dans l'annuaire.
3. Chaque preuve part en `pending` → admin `/admin/verifications`
   (`VerificationReviewCard.tsx`) approuve/rejette.
4. Trigger `recompute_verification_level()` recalcule automatiquement
   `professional_profiles.verification_level` (0 à 5) = nombre de **types**
   de preuves approuvées. Affiché publiquement via `VerificationBadge.tsx`.
5. Trigger `recompute_professional_reputation()` recalcule
   `reputation_score`/`reviews_count` à chaque avis reçu (§7).

*Écart connu : le badge est aujourd'hui uniquement basé sur ce comptage de
preuves, pas sur le parcours par paliers gated décrit dans le dossier
(missions tests notées ≥4.5, etc.), et aucun badge n'est encore lié à un
abonnement payant (Phase 3 du plan d'exécution).*

## 5. Disponibilités & réservation ("booking")

1. `/disponibilites` : le pro publie ses créneaux libres
   (`AvailabilityManager.tsx` → table `availabilities`).
2. Sur `/coachs/[id]`, le client choisit une offre + un créneau
   (`AvailabilityCalendarPublic.tsx` → `NewBookingForm.tsx`) → crée une
   ligne `bookings` en `pending`.
3. **Négociation** (`booking_negotiation`, migration 0017) : chaque partie
   peut contre-proposer une date tant que `status = 'pending'`
   (`last_proposed_by` détermine à qui revient la main dans
   `BookingCard.tsx`).
4. Le pro accepte → `status = 'confirmed'`.
5. Le client paie (`handlePay` → `/api/payment/checkout`) → voir §8 Paiement/Séquestre.
6. Après la date planifiée, le pro marque `completed` ou `no_show`.
7. Si `completed` : le client peut laisser un avis (`ReviewForm.tsx`) —
   policy `reviews_insert_from_completed_booking` exige que ce soit
   *le* client de *cette* réservation `completed` précise.

Machine à états stricte (`enforce_booking_transition`,
`enforce_booking_immutable_fields`) : chaque rôle ne peut faire que les
transitions qui lui reviennent, et les champs structurants (prix, horaire,
parties) sont figés après création — un changement passe par
annulation + nouvelle réservation.

## 6. Mission courte ("j'ai une mission à réaliser")

1. `/publier-mission` : le client décrit le besoin (titre, budget, deadline,
   localisation, catégorie/spécialité) → `missions` en `open`.
2. `/missions` liste les missions ouvertes ; les pros candidatent
   (`ApplyForm.tsx`) → `mission_applications` en `pending` (trigger
   `enforce_mission_open_for_application` bloque toute candidature si la
   mission n'est plus ouverte).
3. Le client voit les candidatures sur `/missions/[id]`
   (`MissionApplicationsPanel.tsx`), accepte une candidature → RPC
   `accept_mission_application` : rejette automatiquement les autres
   candidatures en attente, passe la mission en `in_progress`.
4. Après l'intervention, le client marque la mission `completed`
   (`handleMarkCompleted`).
5. Le client paie (`handlePay`, même endpoint `/api/payment/checkout` que
   pour les réservations, avec `mission_application_id`) → §8.
6. Avis possible une fois payé (`ReviewForm.tsx`, même contrainte que §5).

Différence structurante avec le booking : ici le paiement n'intervient
**qu'après** confirmation de la mission terminée (alors qu'un booking se
paie à la confirmation, avant la prestation) — asymétrie déjà relevée dans
l'audit précédent, à garder en tête si on uniformise un jour le séquestre.

## 7. Avis (déjà couvert dans §5/§6)

Un avis n'est créable que par le client d'une réservation/mission
effectivement `completed`, et il est immuable une fois publié (modération
admin uniquement, `/admin/avis` → `ReviewModerationRow.tsx`). Chaque avis
recalcule automatiquement la réputation publique du professionnel noté.

## 8. Paiement & séquestre

1. `/api/payment/checkout` (`route.ts`) : vérifie que la réservation est
   `confirmed` (ou la mission `completed`), qu'il n'existe pas déjà un
   paiement `success`, crée la transaction FedaPay hébergée et une ligne
   `transactions` en `pending`.
2. Le client paie sur la page FedaPay (Mobile Money ou carte).
3. `/api/webhook/fedapay` (signature HMAC vérifiée) met à jour
   `transactions.status` selon le retour FedaPay (`success`/`failed`/…).
4. **Séquestre (ajouté récemment, migration 0029)** : dès que
   `status = 'success'`, le trigger `compute_transaction_fees()` calcule la
   commission (5 %) et le net dû au pro ; `payout_status` reste `held`
   jusqu'à libération.
5. Admin `/admin/paiements` (`TransactionPayoutRow.tsx`) : libère les fonds
   (RPC `release_transaction_payout`, qui revérifie que la
   réservation/mission liée est bien `completed`) ou ouvre un litige (RPC
   `mark_transaction_disputed`).
6. Le client et le pro voient l'état ("Fonds en séquestre" / "Fonds
   libérés" / "En litige") directement sur `BookingCard.tsx` /
   `MissionApplicationsPanel.tsx`.
7. Versement Mobile Money réel au pro : manuel, hors plateforme, pour ce
   pilote (pas d'API payout intégrée).

*Détail complet de ce parcours dans l'échange précédent de cette
conversation — non reproduit ici pour éviter la redondance.*

## 9. Paramètres du compte

`/parametres` (`AccountSettingsForm.tsx` + `DeactivateAccountSection.tsx`) :
- Édition des champs publics (`profiles` : nom, avatar, bio, ville) et
  privés (`profile_private` : email, téléphone) — deux tables séparées
  volontairement, RLS ne filtrant que des lignes et non des colonnes.
- Désactivation de compte (`is_active = false`) : masque le profil de
  l'annuaire/recherche sans supprimer les données, réversible.

## 10. Notifications

Fil d'événements par utilisateur (`notifications`, table à écriture
exclusivement serveur). Chaque événement métier déclenche
`create_notification()` via un trigger dédié :
réservation (nouvelle demande, contre-proposition, confirmation,
annulation), mission (candidature reçue/retenue/refusée, terminée),
paiement (`payment_success`, et désormais `payout_released`/
`payout_disputed`), parrainage (demande/approbation/refus), vérification
examinée, avis reçu. Affiché via `NotificationBell.tsx`.

## 11. Back-office admin

`/admin` (garde de rôle dans `layout.tsx`, redirige si `role ≠ admin`) :
- **Vérifications** : approuve/rejette les preuves de confiance (§4).
- **Paiements** : libère ou dispute les fonds séquestrés (§8).
- **Utilisateurs** : liste des 100 derniers inscrits, actions sur rôle/statut (`UserRow.tsx`).
- **Avis** : modération des avis litigieux.

Chaque page admin a une double barrière : garde côté UI (redirection si pas
admin) **et** RLS `is_admin()` côté base — la vraie protection reste la
seconde, la première n'est qu'un confort d'UX.

## Vue d'ensemble — les deux moteurs reliés entre eux

```
Inscription (OAuth) ─┬─► Client ──► Annuaire ──► Réservation ──┐
                      │                                         ├─► Paiement ──► Séquestre ──► Avis
                      └─► Devenir pro (parrainage) ──► Profil   │
                          professionnel + Vérifications ──► ────┘
                          (badge de confiance) ──► Mission courte
                                                    (candidature) ─┘

Notifications : émises en continu par chaque étape ci-dessus.
Admin : supervise Vérifications, Paiements, Utilisateurs, Avis — jamais dans le flux normal.
```
