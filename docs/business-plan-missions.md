# EmiID — Plan d'affaires consolidé : Réseau professionnel vérifié + Moteur Missions Courtes

*@hopsyder · Nexus Partners · 15 septembre 2026*
*Sources : `important.md` (analyse d'écart), document "Architecture Missions Courtes & Appels d'Offres", `architecture-profils-domaines.md`, `worklog.md`, et vérification directe du code de `app-emiid` (schéma SQL, migrations, `backend/src`).*

---

## 0. Constat préalable — pourquoi ce document commence par une correction

Avant de trancher quoi que ce soit, une vérification du dépôt `app-emiid` (celui en ligne) s'imposait, parce que `important.md` décrit une "réalité du code" — trigger `compute_transaction_fees()`, migration `0029_escrow`, table `sponsorships`, RPC `request_sponsorship`/`approve_sponsorship`, modèle `Mission`/`Booking`/`Dispute` — et le document "Missions Courtes" propose un schéma Prisma (`CreditWallet`, `Mission`, `MissionApplication`).

Après lecture du schéma maître (`sql/MASTER_EMIID_SCHEMA.sql`) et des **65 migrations** de `sql/migrations/`, ainsi que de `backend/src` (controllers, routes, services) : **aucune de ces tables n'existe dans `app-emiid`**. Ni `Mission`, ni `Booking`, ni `Escrow`, ni `CreditWallet`, ni `Sponsorship`, ni `Dispute`, ni trigger de commission. Ce que `app-emiid` contient réellement (détail section 1) est un produit différent : un réseau professionnel vérifié avec abonnements et boosts payants — pas une marketplace de missions.

Les documents `important.md` et "Missions Courtes" décrivent donc soit une vision cible jamais codée ici, soit le code d'un autre chantier (le rebuild sandbox Next.js/Prisma/SQLite mentionné dans `worklog.md`, où existent bien des modèles `Mission`, `Booking`, `Dispute`). Ce n'est pas grave en soi — mais ça change complètement la nature de l'exercice : **il ne s'agit pas de "réaligner du code existant sur un discours"**, comme le proposait le plan d'arbitrage d'`important.md`. **Il s'agit de construire un module neuf**, sur un socle produit qui, lui, fonctionne déjà et génère déjà du revenu selon une logique différente (et plutôt saine).

Décision validée avec toi : on garde `app-emiid` tel quel comme socle, et le moteur Missions devient un **module additif**. C'est l'option retenue pour la suite de ce document.

---

## 1. Ce qui existe réellement aujourd'hui sur `app-emiid` (socle confirmé)

| Domaine | Ce qui est en place | Preuve dans le dépôt |
|---|---|---|
| Identité & profils | `user_profiles` (privée, RLS) + `public_profiles` (vue filtrée `is_published=true`), slugs auto, onboarding, expériences, PIN de réinitialisation | `MASTER_EMIID_SCHEMA.sql`, migrations `20260622_auto_slug_handle_new_user`, `20260819_add_onboarding_fields`, `20260907b_profile_experiences`, `20260907_pin_reset_verifications` |
| Réseau professionnel | Connexions, abonnements (follow), groupes communautaires, modèles de messages | `add_connections_table.sql`, `20260710_community_groups.sql` (19,5 Ko — gros module), `20260829_message_templates.sql` |
| Messagerie | Contrôleur dédié volumineux (43 Ko), RLS sur messages de groupe | `controllers/messageController.ts`, `20260906_fix_group_messages_mark_as_read_rls.sql` |
| Avis & réputation | Avis + notes privées | `20260906_reviews_and_private_notes.sql` (13 Ko) |
| Recherche | Full-text search, recherche sémantique (embeddings), recherche en langage naturel, géolocalisation GPS, recherche de proximité, mode "nomade" | `20260820_fts_search`, `20260821_semantic_search`, `20260902_enable_semantic_search`, `20260828_search_natural_language`, `20260828_add_gps_location`, `20260828_add_proximity_search`, `20260828_add_nomad_mode` |
| **Monétisation active** | Abonnements à 4 niveaux (`FREE`, `PRO_MONTHLY`, `PRO_ANNUAL`, `B2B`), plus des **Boosts de visibilité** payants à l'acte, facturés via **FedaPay et KKiaPay**, avec suivi de performance du boost (vues, clics WhatsApp, clics appel, partages) | `20260823_monetization_phase1.sql` (ENUM `subscription_tier`, `subscription_status`, `payment_provider`, `payment_type`), `20260824_boosts_phase2.sql`, `20260825_boost_department.sql`, `20260905_boost_compensation.sql`, `20260826_subscription_self_manage.sql`, `services/fedapay.ts`, `controllers/paymentController.ts` (15,7 Ko) |
| Notifications | Web push, préférences, triggers automatiques | `services/pushService.ts`, `002_notification_preferences.sql`, `20260603_setup_notification_triggers.sql` |
| Administration | Autorisation admin par RPC, suspension + journal d'audit | `20260621_add_is_admin_authorization.sql`, `20260708_admin_p0_suspension_audit.sql` |
| Sécurité | RLS renforcée à plusieurs reprises, durcissement du `search_path` des fonctions `SECURITY DEFINER`, contact conditionné à l'authentification | `20260709_security_lints_hardening.sql`, `20260621_harden_security_definer_search_path.sql`, `20260829_gate_contact_by_auth.sql` |

**Confirmé absent** (vérifié par grep sur le schéma et les 65 migrations) : mission, réservation, séquestre, portefeuille de crédits, parrainage, litige, commission par transaction, paliers de confiance 0–5. `authController.ts` fait 1,4 Ko — donc l'authentification actuelle est probablement minimale (email/mot de passe ou OAuth Supabase seul) ; à confirmer, voir section 7.

Point important et plutôt rassurant : le principe **"pas de commission sur le travail du prestataire"**, que `important.md` présente comme un arbitrage stratégique à faire, **est déjà la culture réelle du produit** — `app-emiid` ne prélève jamais de pourcentage sur une prestation, uniquement des abonnements et des boosts de visibilité. Ce n'est donc pas un changement de cap à opérer, juste un principe à prolonger dans le nouveau module.

---

## 2. Ce qu'on reprend du corpus stratégique pour construire le module Missions

Ce qui reste solide et directement exploitable, tel quel :

- **Le diagnostic terrain** (bouche-à-oreille → WhatsApp → négociation opaque → acompte non sécurisé → litige) — analyse de marché toujours valable, à réutiliser dans le dossier DSI Awards et le pitch.
- **Le workflow complet** : cadrage IA du besoin → publication → candidature payante (1 crédit) → sélection → exécution → séquestre optionnel → clôture + avis. C'est une bonne conception, cohérente avec le principe anti-contournement déjà en place.
- **Le modèle économique du module** : packs de crédits (candidature), frais de séquestre optionnel (3–5 %), forfait B2B "Sourcing Express". Cohérent avec la logique d'abonnement + boost déjà en prod — même famille de modèle (vendre de la visibilité/l'accès, pas prélever sur la prestation).

Ce qui doit être **construit à neuf**, pas "corrigé" (puisque rien n'existe) :

- Les paliers de confiance 0–5 avec jalons opérationnels (documents + missions tests notées ≥ 4,5/5), à brancher sur le système de vérification déjà entamé (`pin_reset_verifications`, `is_admin_authorization`) plutôt que d'ouvrir un système parallèle.
- Le parrainage à engagement partagé (règle des 2 manquements), qui n'a aucune trace dans `app-emiid` — donc à concevoir dès le départ avec la logique de sanction du parrain, sans dette technique à rattraper.
- L'authentification téléphone/OTP/WhatsApp — chantier réel mais **indépendant** du module Missions ; ne pas le mélanger dans la même livraison pour ne pas retarder les deux.

---

## 3. Le modèle économique consolidé — la version tranchée

| Cible | Offre | Statut | Tarif (FCFA) | Ce qu'elle inclut |
|---|---|---|---|---|
| Tout profil | Profil Découverte | **En prod** | 0 | Présence annuaire, réseau, messagerie de base, pas de badge |
| Professionnel | Abonnement PRO (mensuel / annuel) | **En prod** | *Montant exact à confirmer côté `paymentController.ts` — non trouvé dans les fichiers consultés* | Badge vérifié, priorité recherche, outils pro |
| Entreprise | Abonnement B2B | **En prod** | *À confirmer* | Accès élargi, gestion multi-profils |
| Tout profil | Boost de visibilité (à l'acte) | **En prod** | *À confirmer* | Mise en avant temporaire, stats (vues, clics WhatsApp/appel, partages) |
| Tout nouvel utilisateur | Bonus de bienvenue | **Nouveau — module Missions** | 3 crédits offerts à l'inscription | Amorce la boucle marketplace sans repousser l'achat de pack de plusieurs mois : le prestataire teste 2-3 candidatures, voit si les annonces sont sérieuses, et bascule vite vers un pack payant une fois le solde à zéro |
| Prestataire | Pack Crédits "Postuler" (Pay-per-Lead) | **Nouveau — module Missions** | Pack 5 : 2 000 (400/u) · Pack 15 : 5 000 (333/u) | Consommé pour candidater à une mission publiée, une fois le bonus de bienvenue épuisé |
| Client / diaspora | Séquestre garanti (Escrow) | **Nouveau — module Missions, phase manuelle puis auto** | 3 à 5 % du montant | Fonds bloqués jusqu'à validation du service fait |
| B2B / institutions | Sourcing Express | **Nouveau — module Missions** | 15 000 par besoin pourvu | 3 profils vérifiés sélectionnés sous 24h |

Principe transversal, non négociable pour le nouveau module : **jamais de commission sur le montant de la prestation elle-même** — uniquement des frais d'accès (crédits), de sécurisation (séquestre optionnel) ou de service (sourcing express), exactement dans l'esprit du modèle déjà en place.

---

## 4. Les 6 écarts d'`important.md`, retranchés à la lumière du vrai code

| # | Écart identifié dans `important.md` | Ce que le code réel montre | Décision retenue |
|---|---|---|---|
| 1 | Commission 5 % vs abonnements/crédits | Pas de commission du tout en prod ; déjà abonnements + boosts | **Confirmer et prolonger** : le module Missions n'introduit aucune commission, seulement crédits + séquestre optionnel + sourcing express |
| 2 | Parrainage binaire vs strikes | Aucun parrainage en base | **Concevoir dès le départ** la version à engagement partagé (2 manquements max), pas de dette à corriger |
| 3 | Comptage de documents vs paliers probatoires | Système de vérification embryonnaire (PIN, autorisation admin), pas de niveaux 0–5 | **Construire** les 6 paliers (0 à 5) avec jalons réels (missions tests notées ≥ 4,5), branchés sur les tables de vérification existantes |
| 4 | 100 % OAuth vs téléphone/WhatsApp | `authController.ts` très court (1,4 Ko) — mode d'auth actuel à confirmer | **Chantier séparé**, traité en parallèle mais indépendamment du module Missions — ajout, pas remplacement, pour ne pas perturber les comptes déjà inscrits |
| 5 | Candidature gratuite vs pay-per-lead | Aucune notion de mission n'existe | **Pay-per-Lead dès le lancement** (1 crédit), avec **3 crédits offerts à l'inscription à tout nouvel utilisateur** (révisé de 10 à 3 le 16/09 — voir §5 bis) pour amorcer la boucle marketplace sans dépendre d'un achat immédiat, tout en testant la disposition à payer dès la première semaine plutôt que dans plusieurs mois |
| 5bis | Nombre de candidatures par mission | Non applicable | **Plafond de 2 candidatures par mission** (`max_applications`) : le client compare 2 profils qualifiés plutôt que d'être submergé, et le prestataire a 1 chance sur 2 d'être choisi quand il dépense son crédit — la mission bascule automatiquement en `APPLICATIONS_CLOSED` dès la 2e candidature, verrouillé côté base (pas seulement côté frontend) |
| 6 | Déblocage escrow manuel vs automatique | Aucun escrow n'existe | **Démarrage en validation manuelle admin**, mais avec un filet de sécurité dès le jour 1 pour le prestataire : statut `DELIVERED` posé par le pro + fenêtre de 72h de contestation client → validation tacite et déblocage automatique si le client ne réagit pas. Bascule vers un déblocage 100 % automatique programmée dès qu'un seuil de volume est atteint (proposition : 50 missions/mois). Décision explicitement phasée, pas un renoncement |

---

## 5. Esquisse du schéma de données à ajouter (cohérent avec le style Supabase/Postgres déjà en place)

`app-emiid` utilise des migrations SQL numérotées par date avec RLS systématique (`auth.uid()`) — le module Missions doit suivre exactement le même style plutôt qu'introduire du Prisma. Version corrigée après revue technique (voir §5 bis pour le détail des corrections) :

```sql
-- 20260916_missions_engine_phase1.sql

DO $$ BEGIN
  CREATE TYPE public.mission_status AS ENUM
    ('DRAFT','PUBLISHED','APPLICATIONS_OPEN','APPLICATIONS_CLOSED','ASSIGNED','IN_PROGRESS','DELIVERED','COMPLETED','DISPUTED','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- APPLICATIONS_CLOSED (nouveau, 16/09) : posé automatiquement par consume_credit_for_application()
-- dès que max_applications candidatures sont atteintes. Le client peut toujours sélectionner
-- parmi les candidats reçus depuis ce statut ; il n'est pas bloquant pour ASSIGNED.

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('PENDING','ACCEPTED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     integer NOT NULL DEFAULT 3 CHECK (balance >= 0),   -- révisé 10 -> 3 le 16/09 (voir §5 bis)
  updated_at  timestamptz NOT NULL DEFAULT now()
);
-- Le trigger de création (à brancher sur l'inscription, même schéma que auto_slug_handle_new_user)
-- doit aussi insérer une ligne credit_transactions (amount: 3, type: 'WELCOME_BONUS') pour la traçabilité.

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id    uuid NOT NULL REFERENCES public.credit_wallets(id) ON DELETE CASCADE,
  amount       integer NOT NULL,                 -- +10 (bienvenue), +5/+15 (achat), -1 (candidature), +1 (remboursement)
  type         text NOT NULL,                     -- 'WELCOME_BONUS' | 'PURCHASE' | 'APPLICATION_FEE' | 'REFUND'
  mission_id   uuid REFERENCES public.missions(id),   -- tracer quelle mission a généré le débit/remboursement
  payment_id   uuid REFERENCES public.payments(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.missions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES auth.users(id),
  title             text NOT NULL,
  description       text NOT NULL,
  category          text,
  budget_min        integer,
  budget_max        integer,
  -- Verrouillé sur XOF pour le pilote (zone UEMOA / Mobile Money) : pas de gestion
  -- multi-devise en v1. Une mission diaspora en EUR/USD sera convertie côté FedaPay/KKiaPay
  -- au moment du paiement, pas stockée nativement dans une autre devise (voir §5 bis, point 1).
  currency          char(3) NOT NULL DEFAULT 'XOF' CHECK (currency = 'XOF'),
  deadline          timestamptz,
  location          text,                          -- libellé humain ("Cotonou - Akpakpa")
  -- Géolocalisation : PAS de PostGIS ici (l'extension n'est utilisée nulle part dans app-emiid).
  -- On reprend exactement le pattern déjà en place sur user_profiles (voir §5 bis, point 2).
  latitude          decimal(10,8),
  longitude         decimal(11,8),
  status            public.mission_status NOT NULL DEFAULT 'PUBLISHED',
  has_escrow        boolean NOT NULL DEFAULT false,
  escrow_fee_bps    integer NOT NULL DEFAULT 0,     -- ex. 300 = 3%
  selected_pro_id   uuid REFERENCES auth.users(id),
  max_applications  integer NOT NULL DEFAULT 2,      -- nouveau 16/09 : plafond de candidatures, verrouillé en base
  started_at        timestamptz,                    -- posé à ASSIGNED -> IN_PROGRESS
  delivered_at      timestamptz,                     -- posé par le PRO (nouveau statut DELIVERED)
  auto_release_at   timestamptz,                     -- = delivered_at + 72h, calculé à la livraison
  client_confirmed_at timestamptz,                   -- si le client valide avant l'échéance
  expires_at        timestamptz,                     -- deadline de candidature (défaut : +7 jours)
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id     uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  pro_id         uuid NOT NULL REFERENCES auth.users(id),
  proposed_price integer NOT NULL,     -- toujours dans la devise de la mission (XOF, v1)
  pitch          text,
  status         public.application_status NOT NULL DEFAULT 'PENDING',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, pro_id)
);

ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet propriétaire" ON public.credit_wallets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Missions lecture publique" ON public.missions
  FOR SELECT USING (status IN ('PUBLISHED','APPLICATIONS_OPEN'));

CREATE POLICY "Missions gestion client" ON public.missions
  FOR ALL USING (auth.uid() = client_id);

-- Recherche par proximité : même technique que search_profiles_by_proximity
-- (20260828_add_proximity_search.sql), appliquée aux missions plutôt qu'aux profils.
CREATE OR REPLACE FUNCTION public.search_missions_by_proximity(
    p_lat numeric, p_lng numeric, p_radius_km numeric DEFAULT 50
) RETURNS TABLE (mission_id uuid, distance_km numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT id, (6371 * acos(cos(radians(p_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(latitude))))::numeric
    FROM public.missions
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND status IN ('PUBLISHED','APPLICATIONS_OPEN')
      AND (6371 * acos(cos(radians(p_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(latitude)))) <= p_radius_km
    ORDER BY 2 ASC;
$$;

-- Candidature atomique : verrouille le portefeuille (FOR UPDATE), vérifie le solde,
-- débite 1 crédit, journalise la transaction et crée la candidature dans une seule
-- transaction — empêche qu'un même prestataire poste 2 candidatures avec 1 seul crédit
-- restant depuis deux onglets/appareils en parallèle.
-- Révisée le 16/09 : verrouille désormais la MISSION en premier (avant le portefeuille, même
-- ordre à chaque appel -> pas de deadlock possible) pour appliquer le plafond max_applications
-- de façon atomique, en plus du verrou anti-double-candidature sur le solde de crédits.
CREATE OR REPLACE FUNCTION public.consume_credit_for_application(
  p_user_id    uuid,
  p_mission_id uuid,
  p_price      integer,
  p_pitch      text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_wallet_id        uuid;
  v_balance          integer;
  v_app_id           uuid;
  v_current_apps_cnt integer;
  v_max_apps         integer;
BEGIN
  -- 1. Verrouiller la mission pour figer le quota de candidatures (empêche 2 candidatures
  --    simultanées de dépasser max_applications depuis deux onglets/appareils différents)
  SELECT max_applications INTO v_max_apps
  FROM public.missions
  WHERE id = p_mission_id AND status IN ('PUBLISHED','APPLICATIONS_OPEN')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cette mission n''accepte plus de candidatures' USING ERRCODE = 'P0002';
  END IF;

  SELECT count(*) INTO v_current_apps_cnt
  FROM public.mission_applications
  WHERE mission_id = p_mission_id;

  IF v_current_apps_cnt >= v_max_apps THEN
    UPDATE public.missions SET status = 'APPLICATIONS_CLOSED', updated_at = now() WHERE id = p_mission_id;
    RAISE EXCEPTION 'Le quota de candidatures est déjà atteint pour cette mission' USING ERRCODE = 'P0003';
  END IF;

  -- 2. Verrouiller le portefeuille du candidat et vérifier le solde
  SELECT id, balance INTO v_wallet_id, v_balance
  FROM public.credit_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL OR v_balance < 1 THEN
    RAISE EXCEPTION 'Solde de crédits insuffisant' USING ERRCODE = 'P0001';
  END IF;

  -- 3. Débiter le crédit et journaliser
  UPDATE public.credit_wallets
    SET balance = balance - 1, updated_at = now()
    WHERE id = v_wallet_id;

  INSERT INTO public.credit_transactions (wallet_id, amount, type, mission_id)
    VALUES (v_wallet_id, -1, 'APPLICATION_FEE', p_mission_id);

  -- 4. Enregistrer la candidature (la contrainte UNIQUE(mission_id, pro_id) fait échouer
  --    tout doublon, ce qui annule alors TOUTE la transaction, y compris le débit ci-dessus)
  INSERT INTO public.mission_applications (mission_id, pro_id, proposed_price, pitch)
    VALUES (p_mission_id, p_user_id, p_price, p_pitch)
    RETURNING id INTO v_app_id;

  -- 5. Si c'était la dernière place disponible, fermer la mission aux nouvelles candidatures
  IF (v_current_apps_cnt + 1) >= v_max_apps THEN
    UPDATE public.missions SET status = 'APPLICATIONS_CLOSED', updated_at = now() WHERE id = p_mission_id;
  END IF;

  RETURN v_app_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_credit_for_application(uuid, uuid, integer, text) TO authenticated;

-- Soupape de sortie (16/09) : si le client n'aime aucun des 2 candidats reçus, il doit pouvoir
-- rouvrir la mission sans frais pour lui ni pour les prestataires déjà passés — augmente
-- simplement max_applications et repasse le statut à APPLICATIONS_OPEN. Sans cette fonction,
-- le plafond de 2 devient un piège UX si le client n'est satisfait par aucun des deux profils.
CREATE OR REPLACE FUNCTION public.reopen_mission_applications(p_mission_id uuid, p_extra_slots integer DEFAULT 2)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.missions
    SET max_applications = max_applications + p_extra_slots,
        status = 'APPLICATIONS_OPEN',
        updated_at = now()
    WHERE id = p_mission_id
      AND client_id = auth.uid()
      AND status = 'APPLICATIONS_CLOSED';
END;
$$;

GRANT EXECUTE ON FUNCTION public.reopen_mission_applications(uuid, integer) TO authenticated;

-- Remboursement automatique des crédits : à exécuter par un job planifié (pg_cron / endpoint),
-- même mécanisme que expire_subscriptions() déjà prévu dans 20260823_monetization_phase1.sql.
-- Règle : une mission CANCELLED sans sélection, ou PUBLISHED/APPLICATIONS_OPEN expirée (expires_at
-- dépassé, défaut 7 jours) sans candidat retenu, recrédite 1 crédit à chaque candidat PENDING.
CREATE OR REPLACE FUNCTION public.refund_credits_for_unresolved_mission(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT ma.pro_id, cw.id AS wallet_id
    FROM public.mission_applications ma
    JOIN public.credit_wallets cw ON cw.user_id = ma.pro_id
    WHERE ma.mission_id = p_mission_id AND ma.status = 'PENDING'
  LOOP
    UPDATE public.credit_wallets SET balance = balance + 1, updated_at = now() WHERE id = r.wallet_id;
    INSERT INTO public.credit_transactions (wallet_id, amount, type, mission_id)
      VALUES (r.wallet_id, 1, 'REFUND', p_mission_id);
  END LOOP;
END;
$$;
```

Ce schéma réutilise `payment_provider`/`payment_type` déjà définis dans `20260823_monetization_phase1.sql` (il suffit d'ajouter `'CREDIT_PACK'` et `'MISSION_ESCROW'` à l'ENUM `payment_type`) — donc **FedaPay/KKiaPay et `paymentController.ts` sont réutilisables tels quels** pour encaisser les packs de crédits et les frais de séquestre, sans nouveau prestataire de paiement.

### 5 bis. Corrections apportées après revue technique (16 septembre)

Une relecture technique a soulevé cinq points sur la v1 du schéma (§5) et un point de périmètre produit (§3). Les quatre premiers sont acceptés tels quels, le cinquième est corrigé sur le fond (la prémisse technique était fausse), le sixième est traité comme un nouveau chantier plutôt qu'un oubli :

| Sujet | Ce qui était écrit | Ce qui manquait | Correction actée |
|---|---|---|---|
| Cycle de vie mission | Le client seul décide de `COMPLETED` | Un client de mauvaise foi peut ne jamais valider, bloquant le prestataire indéfiniment | Nouveau statut `DELIVERED` posé par le pro (`delivered_at`) → fenêtre de 72h (`auto_release_at`) → validation tacite et libération automatique si le client ne conteste pas |
| Crédits | 1 crédit débité par candidature, sans contrepartie | Aucun remboursement si la mission est annulée sans sélection ou expire sans réponse | Fonction `refund_credits_for_unresolved_mission()` : recrédite chaque candidat `PENDING` si la mission passe `CANCELLED` sans sélection, ou expire (`expires_at`, défaut 7 jours) sans candidat retenu |
| Concurrence sur le solde | Décrément direct (`UPDATE credit_wallets`) depuis le backend | Un prestataire ouvrant 2 sessions pourrait postuler 2 fois avec 1 seul crédit (race condition) | Débit, journalisation et création de la candidature encapsulés dans une seule fonction RPC transactionnelle (`consume_credit_for_application`, verrou `FOR UPDATE`) |
| Devise | `proposed_price integer` sans lien explicite à la devise | Risque de calcul faussé si une mission diaspora était publiée en EUR/USD | **Verrouillé sur XOF pour le pilote** (`CHECK (currency = 'XOF')`) — le pilote cible Cotonou/Calavi en Mobile Money, donc pas de multi-devise natif en v1 ; une conversion éventuelle se ferait côté FedaPay/KKiaPay au paiement, jamais en stockant une devise différente dans `missions` |
| Géolocalisation | `location text` seul, pas de champ exploitable pour un rayon kilométrique | — | **Correction de la prémisse** : `app-emiid` n'utilise **pas** PostGIS — vérifié dans `20260828_add_gps_location.sql` (colonnes `latitude`/`longitude` en `DECIMAL`) et `20260828_add_proximity_search.sql` (fonction Haversine pure SQL, pas d'extension `postgis`). Ajouter `geography(Point,4326)` aurait introduit une dépendance absente du reste du projet. Correction retenue : mêmes colonnes `latitude`/`longitude` + même fonction Haversine, dupliquée pour `missions` (`search_missions_by_proximity`) |
| Périmètre produit | Le plan ne couvrait que Réseau Pro + Missions | La "réservation directe d'une offre existante" (agenda, séance bookable en un clic chez un pro déjà identifié) n'était pas traitée | Ce n'est pas un oubli d'un module existant : **vérifié absent** de `app-emiid` au même titre que les missions (aucun contrôleur `booking`/`offer` dans `backend/src/controllers`). C'est un **second pilier additif**, distinct des Missions (candidature ouverte) — traité comme nouvelle phase de roadmap, voir §6, Phase 6, plutôt que mélangé au schéma Missions |

---

## 6. Feuille de route d'implémentation sur `app-emiid`

| Phase | Contenu | Effort estimé | Dépendances |
|---|---|---|---|
| **1 — Fondations** | Migration schéma ci-dessus, portefeuille de crédits, achat de packs via FedaPay/KKiaPay (réutilise `services/fedapay.ts`), CRUD mission basique (sans IA), candidature payante | ~2 semaines | Aucune |
| **2 — Cadrage IA & notifications** | Génération assistée du cahier des charges (à confirmer : y a-t-il déjà une clé IA/LLM branchée dans `app-emiid` ? non vérifié — voir section 7), notifications push (réutilise `pushService.ts`), sélection/attribution | ~2–3 semaines | Phase 1 |
| **3 — Sécurisation & clôture** | Séquestre en mode validation manuelle admin, interface admin de validation (dans la logique de `admin_p0_suspension_audit`), avis vérifiés post-mission | ~2 semaines | Phase 1 |
| **4 — Confiance** | Paliers 0–5 branchés sur les tables de vérification existantes, parrainage à engagement partagé (2 manquements) | ~3 semaines | Phase 3 |
| **5 — Scale** | Bascule vers déblocage escrow automatique (seuil de volume), Sourcing Express B2B, comptes organisation | À planifier une fois le pilote validé | Phases 1–4 |
| **6 — Réservation directe d'offres** | Nouveau pilier, distinct des Missions : un client réserve en un clic une offre fixe déjà publiée par un pro (ex. "Séance 1h — 25 000 FCFA"), sans appel d'offres ni candidature. Nécessite `offers` (catalogue de prestations par pro) + `bookings` (créneau, statut, lien vers l'agenda du pro) — aucune des deux tables n'existe aujourd'hui | ~2–3 semaines | Peut démarrer en parallèle de la Phase 1 (schéma indépendant des Missions) |

L'authentification téléphone/OTP/WhatsApp (écart #4) est **hors de cette feuille de route** — chantier à cadrer séparément une fois `authController.ts` audité.

---

## 7. Ce qui reste à valider avec toi (hypothèses non vérifiées, à ne pas prendre pour acquis)

- **Montants exacts** des abonnements `PRO_MONTHLY`, `PRO_ANNUAL` et `B2B` actuellement en prod — non trouvés dans les fichiers consultés (probablement codés en dur côté `paymentController.ts` ou en frontend) ; le tableau du § 3 laisse ces cases à confirmer plutôt que d'inventer un chiffre.
- **Présence ou non d'une intégration IA** (Gemini ou autre) déjà câblée dans `app-emiid` — je n'ai pas trouvé de service dédié dans `backend/src/services/`, donc à confirmer avant de dimensionner la phase 2.
- **Contenu réel de `authController.ts`** (1,4 Ko seulement) — pour savoir précisément ce qui existe aujourd'hui côté authentification avant de cadrer le chantier OTP/WhatsApp.
- **Lien entre le "badge Fondateur #001–#1000"** (mentionné pour app.emiid.com) et les migrations de boost/vérification observées — à clarifier si ce badge doit s'articuler avec les nouveaux paliers 0–5.

---

## 8. Impact sur le dossier DSI Awards 2026

Ce document permet de fermer, pour de bon, l'écart discours/code identifié par `important.md` : le dossier peut désormais présenter deux moteurs réellement cohérents avec le code — le réseau professionnel vérifié (déjà en ligne, déjà monétisé) et le moteur Missions Courtes (feuille de route concrète, phasée, sans dette technique à justifier). C'est un argument plus solide devant un jury que la version précédente, qui présentait comme acquis un système qui n'existait dans aucun des deux dépôts sous cette forme précise.
