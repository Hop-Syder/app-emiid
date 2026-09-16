# Dossier juridique EmiID — Version Consolidée

> **Date de mise à jour** : 15 septembre 2026  
> **Auteur / Organisation** : @hopsyder · Nexus Partners  
> **Statut** : Base de travail technique et juridique consolidée — à faire contresigner par un avocat inscrit au barreau du Bénin avant exploitation définitive.  
> **Textes publics intégrés dans l'app** : Pages « Légal & Confidentialité » (`/conditions`, `/confidentialite`, `/cadre-juridique`).

---

## Partie I — Analyse juridique & Qualification du projet EmiID

### 1.1 Nature de l'activité
EmiID est une **plateforme numérique professionnelle béninoise** opérant à la fois comme **annuaire professionnel vérifié** et comme **moteur de missions courtes et d'appels d'offres**. Elle met en relation des clients (particuliers, entreprises, diaspora) et des professionnels/artisans qualifiés à Cotonou, au Bénin et dans la zone UEMOA.

**Services opérationnels :**
1. **Identité & Profils certifiés** : profils publics indexés, badges vérifiés, portfolio de compétences et réalisations.
2. **Moteur Missions Courtes & Appels d'offres** : publication de besoins, cadrage assisté par IA, candidatures payantes limitées (Pay-per-Lead), attribution transparente.
3. **Séquestre Garanti optionnel (Escrow)** : cantonnement des fonds de la mission jusqu'à validation de service fait (statut `DELIVERED` + fenêtre de contestation de 72h).
4. **Paliers de confiance (0 à 5)** : progression vérifiable par documents d'identité (CNI/CIP/passeport), documents professionnels (IFU, registre, atelier) et avis de missions notées ≥ 4,5/5.
5. **Parrainage à engagement partagé** : co-optation entre pairs avec règle des 2 manquements (strikes) et responsabilité réputationnelle du parrain.
6. **Sourcing Express B2B** : forfait d'intermédiation pour les entreprises (3 profils vérifiés sourcés sous 24h).
7. **Monétisation active** : abonnements PRO (mensuel/annuel), boosts de visibilité communaux et départementaux, packs de crédits de candidature (FedaPay Mobile Money).

### 1.2 Qualification juridique fondamentale
**Intermédiaire technique de mise en relation et Mandataire de séquestre conventionnel.**
- **Pas d'employeur ni de loueur d'ouvrage** : EmiID ne conclut aucun contrat de travail avec les prestataires, ne donne aucune directive hiérarchique sur l'exécution des chantiers et ne s'immisce pas dans l'artisanat.
- **Principe de non-commissionnement sur le travail** : EmiID ne prélève **aucun pourcentage sur la prestation de l'artisan**. Les revenus proviennent exclusivement de frais d'accès (abonnements, crédits Pay-per-lead), de visibilité (boosts), de sécurisation (frais de séquestre 3-5%) ou de services B2B (sourcing express). Ce point écarte tout risque de requalification en contrat d'agence commerciale ou en travail dissimulé.
- **Tiers séquestre conventionnel** : Sur les missions avec séquestre, EmiID agit en qualité de dépositaire de fonds sous mandat réciproque (Code civil applicable au Bénin et droit OHADA des contrats), dans l'attente de la confirmation des livrables.

### 1.3 Architecture technique & Flux de données réels
1. **Base de données & Auth** : **Supabase (PostgreSQL 15+)** avec chiffrement au repos, Row Level Security (RLS) stricte, JWT Supabase Auth et sessions SSR via cookies sécurisés (`HttpOnly`, `SameSite=Lax`, `Secure`).
2. **API & Traitements métier** : Backend **Node.js / Express / TypeScript** hébergé sur **Render** (reverse proxy sécurisé avec terminaison TLS/HTTPS stricte).
3. **Frontend Web & Mobile PWA** : **Next.js 15 (App Router), React 19** hébergé sur **Vercel**.
4. **Localisation & Données GPS** : Coordonnées GPS (`latitude`, `longitude`) collectées sur **consentement explicite** pour la recherche de proximité kilométrique (formule Haversine SQL) et le mode nomade de l'artisan. Possibilité pour l'utilisateur de désactiver le GPS et de se limiter à la localisation déclarée (Commune / Ville).
5. **Paiements Mobile Money** : Intégration de **FedaPay** (prestataire technique agréé BCEAO). EmiID ne traite ni ne stocke aucun numéro de carte, compte bancaire complet ou code secret PIN Mobile Money.
6. **Intelligence Artificielle** : **Google Gemini (gemini-3.6-flash)** via API REST directe. Traitement exclusif de la description libre du besoin client pour produire un brouillon structuré de mission. Principe strict **Human-in-the-loop** : l'IA ne publie jamais de mission automatiquement, le client valide ou corrige chaque champ avant publication.
7. **Pièces KYC / Vérification** : Documents d'identité (CNI, CIP, passeport, IFU, registre, certificat d'atelier) stockés dans un bucket Supabase Storage privé inaccessible au public, consultables exclusivement par les administrateurs habilités.

---

## Partie II — Cadre légal et réglementaire applicable

### 2.1 Droit béninois (Normes impératives)
| Texte | Référence | Impact opérationnel pour EmiID |
|---|---|---|
| **Code du numérique** | Loi n° 2017-20 du 20 avril 2018 (modifiée par la loi n° 2020-35 du 6 janvier 2021) | • Protection des données personnelles (livre V, art. 379 et s.)<br>• Obligation de déclaration / formalités préalables auprès de l'APDP<br>• Sécurité des systèmes et notification des incidents de cybersécurité<br>• Régime des prestataires techniques et du commerce électronique |
| **Code pénal & Cybercriminalité** | Livre IV du Code du numérique | Répression de l'escroquerie en ligne, usurpation d'identité et accès illégitime aux données |
| **Droit civil des contrats** | Code civil applicable au Bénin | Validité de l'acceptation électronique des CGU/CGV, mandat de séquestre conventionnel |

### 2.2 Réglementation financière UEMOA / BCEAO
| Règle | Source | Application EmiID |
|---|---|---|
| **Règlement n° 15/2002/CM/UEMOA** | Systèmes de paiement UEMOA | Utilisation exclusive de passerelles de paiement partenaires agréées (FedaPay / banques et opérateurs émetteurs de monnaie électronique) |
| **Instruction BCEAO n° 008-05-2015** | Émission de monnaie électronique | EmiID n'émet pas de monnaie électronique. Le séquestre est un cantonnement sous mandat d'intermédiaire via les comptes marchands agréés |

### 2.3 Espace communautaire CEDEAO & OHADA
- **Acte additionnel CEDEAO A/SA.1/01/10** : protection des données personnelles dans l'espace ouest-africain (harmonisation des flux transfrontaliers).
- **Actes uniformes OHADA** :
  - Droit commercial général (statut des commerçants et artisans inscrits).
  - Droit des sûretés et droit de l'arbitrage (clause de règlement des différends dans les CGU).

### 2.4 Convention de Malabo (Union africaine)
Convention sur la cybersécurité et la protection des données personnelles (entrée en vigueur le 8 juin 2023) : principes de souveraineté numérique et coopération contre la cybercriminalité.

---

## Partie III — Politique de protection des données & Vie privée

### 3.1 Registre des données traitées
| Catégorie | Données précises | Finalité | Durée de conservation |
|---|---|---|---|
| **Comptes utilisateurs** | Nom, prénom, email, téléphone, mot de passe haché (bcrypt) | Gestion de compte, authentification, notifications | Durée du compte + 3 ans d'inactivité |
| **Profils professionnels** | Métier, spécialité, bio, compétences, photos portfolio, tarifs | Publication dans l'annuaire, moteur de recherche | Durée d'activation du profil |
| **Localisation** | Coordonnées GPS (latitude/longitude), commune, département | Recherche de proximité géographique, missions locales | Modifiable à tout moment ; supprimée si compte clos |
| **Vérification KYC** | CNI, CIP, Passeport, IFU, Registre, photo atelier | Attribution des Paliers de confiance (1 à 3), lutte anti-fraude | Durée d'inscription + 5 ans (obligations probatoires) |
| **Missions & Séquestre** | Titre, budget, devis proposé, pitch, statut, transactions | Exécution de la mise en relation, traçabilité comptable | 10 ans (prescriptions commerciales et fiscales) |
| **Avis & Réputation** | Note (1-5), commentaire, historique de complétion | Calcul automatique du Palier 4 et 5, confiance publique | Durée de vie de la plateforme (anonymisé si départ) |
| **Parrainage & Strikes** | Lien parrain-filleul, motifs des manquements | Traçabilité de l'engagement partagé et de la modération | Durée du statut parrainé |

### 3.2 Droits des utilisateurs
Conformément au Code du numérique béninois :
- **Droit d'accès et de rectification** : directement accessible dans les paramètres du compte (`/parametres`).
- **Droit à l'effacement** : suppression possible du compte sous réserve des obligations légales de conservation des transactions financières.
- **Exercice des droits** : par email à `privacy@emiid.com` ou `dpo@emiid.com` (délai de réponse : 30 jours).
- **Recours APDP** : Autorité de Protection des Données Personnelles du Bénin (apdp.bj, numéro vert 150).

---

## Partie IV — Conditions Générales d'Utilisation & de Vente (CGU / CGV)

### 4.1 Modèle de facturation et crédits (Pay-per-Lead)
1. **Bonus de bienvenue** : 3 crédits offerts à chaque nouvel utilisateur inscrit pour tester l'écosystème.
2. **Packs de crédits** :
   - Pack 5 crédits : 2 000 FCFA (400 FCFA / candidature).
   - Pack 15 crédits : 5 000 FCFA (333 FCFA / candidature).
3. **Consommation** : 1 crédit est débité de manière irrévocable lors du dépôt d'une candidature (`consume_credit_for_application`). Le crédit finance le droit de postuler et la mise en relation qualifiée (plafonnée à 2 candidats max par mission).
4. **Remboursement de crédits** : Si la mission est annulée sans qu'aucun candidat ne soit retenu ou si elle expire sans réponse du client (`APPLICATIONS_CLOSED` / `EXPIRED`), les crédits sont automatiquement recrédités aux candidats en attente (`refund_credits_for_unresolved_mission`).

### 4.2 Fonctionnement du Séquestre Garanti (Escrow)
1. **Souscription** : Optionnel, activé lors de la publication de la mission par le client. Frais de sécurisation de 3 à 5 % calculés au prorata du devis retenu.
2. **Cantonnement** : Le client provisionne la totalité du montant convenu via FedaPay (Mobile Money). Les fonds sont marqués `HELD`.
3. **Exécution & Livraison** :
   - Le pro démarre la mission (`start_mission_work`) → statut `IN_PROGRESS`.
   - Le pro déclare la livraison des travaux (`mark_mission_delivered`) → statut `DELIVERED`.
4. **Validation tacite sous 72h** : Le client dispose d'un délai strict de 72 heures pour vérifier le travail. À défaut de contestation ou de confirmation dans ce délai, la mission est réputée conforme et validée tacitement (`COMPLETED`).
5. **Reversement** : À l'issue de la mission `COMPLETED`, EmiID reverse l'intégralité du montant au prestataire par Mobile Money sous 24-48h ouvrées.

### 4.3 Procédure de Litige & Arbitrage
- En cas de désaccord pendant la fenêtre de 72h, le client ouvre un litige motivé (`open_mission_dispute`) → statut `DISPUTED`.
- Les administrateurs d'EmiID interviennent en qualité d'arbitres amiables sous 5 jours ouvrés.
- Deux issues possibles arrêtées par l'arbitrage admin (`resolve_mission_dispute`) :
  - **Prestation conforme** (`RELEASE_TO_PRO`) : validation `COMPLETED` et paiement du prestataire.
  - **Manquement caractérisé** (`REFUND_CLIENT`) : annulation `CANCELLED`, remboursement intégral du client et enregistrement éventuel d'un strike sur le pro.

### 4.4 Engagement Partagé de Parrainage
- Tout artisan parrainant un pair cautionne sa moralité professionnelle.
- **Règle des 2 manquements** : Au 2e strike prononcé contre son filleul, le parrainage est résilié de plein droit.
- **Sanction parrain** : Si un parrain accumule 2 filleuls révoqués, il subit un déclassement de son propre palier de confiance (`trust_tier - 1`) et la suspension temporaire de son droit de parrainage. Aucune responsabilité pécuniaire n'est imputée au parrain.

---

## Partie V — Intelligence Artificielle & Cadrage de Mission

1. **Fournisseur technique** : Google Cloud / Google Generative AI (Gemini Flash).
2. **Champs traités** : Uniquement le texte brut de la description libre de mission ou la transcription vocale. Aucune pièce d'identité, coordonnées bancaires ou données privées d'authentification ne sont transmises à l'API IA.
3. **Non-entraînement** : Le contrat d'API payante garantit que les données soumises ne sont pas utilisées pour l'entraînement public des modèles de Google.
4. **Human-in-the-Loop obligatoire** : L'IA formule uniquement une proposition de structuration (titre, métier, description résumée, fourchette de budget indicative). Le client conserve le contrôle total et doit valider explicitement le formulaire avant toute publication.

---

## Partie VI — Tableau de conformité réglementaire EmiID

| Obligation légale | Statut EmiID | Mesures techniques & contractuelles |
|---|---|---|
| **Déclaration APDP** | À finaliser | Dossier technique prêt, formulaires de déclaration des traitements à déposer au siège de l'APDP Cotonou. |
| **Consentement cookies & traceurs** | Conforme | Pas de cookies publicitaires tiers. Uniquement cookies de session `@supabase/ssr` nécessaires au fonctionnement. |
| **Sécurité des mots de passe** | Conforme | Chiffrement bcrypt / Argon2 via Supabase Auth. Salage fort. |
| **Sécurité des transactions** | Conforme | Passerelle FedaPay certifiée PCI-DSS, pas de stockage de données bancaires sensibles par EmiID. |
| **Géolocalisation consentie** | Conforme | Demande d'autorisation de navigateur claire. Fonctionnement dégradé possible sans GPS (commune seule). |
| **Protection contre l'exercice illégal** | Conforme | Paliers de confiance 1 à 5 exigeant IFU et registres pour les professions réglementées. |
| **Traçabilité des accès administrateurs** | Conforme | Tables d'audit des suspensions (`admin_p0_suspension_audit`), reversements manuels tracés avec `p_admin_id`. |

---

## Partie VII — Recommandations pour l'Avocat Conseil (Nexus Partners)

1. Valider la rédaction exacte des **clauses de séquestre conventionnel** pour les conformer expressément au droit des obligations béninois.
2. Déposer le **dossier de déclaration de traitement de données à caractère personnel** auprès de l'APDP (Bénin).
3. Confirmer l'absence d'assujettissement à la réglementation des établissements de paiement grâce au recours exclusif à des partenaires financiers agréés (FedaPay / banques partenaires).
4. Insérer une **clause compromissoire d'arbitrage OHADA** pour les litiges B2B Sourcing Express avec les entreprises.

---
*Dossier juridique révisé et consolidé le 15 septembre 2026 par Nexus Partners.*
