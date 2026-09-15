# Dossier juridique EmiID

> Date de rédaction / vérification des sources : **14 septembre 2026**
> Statut : base de travail complète — à faire valider par un avocat inscrit au barreau du Bénin avant usage définitif.
> Textes publics intégrés dans l'app : onglet « Légal & Confidentialité » (footer → Confidentialité / Conditions / Cadre juridique). Source de contenu : `src/lib/legal/content.ts`.

---

## Partie I — Analyse juridique du projet

### 1.1 Nature de l'activité
EmiID est une **place de marché (marketplace) numérique béninoise** mettant en relation des **clients** et des **professionnels vérifiés** de **12 domaines d'activité** (artisan, commerçant, freelance, entreprise, agence, startup, ONG/association, investisseur, institution publique, étudiant, école/centre de formation, en recherche d'opportunités) à Cotonou et au Bénin. Services : profils vérifiés, réservations, missions courtes, messagerie intégrée (temps réel), avis, parrainage, médiation de litiges. Paiement Mobile Money à venir (FedaPay / MTN MoMo / Moov Money).

Qualification : **intermédiaire technique de mise en relation** (et non employeur ni agence de placement). Ce positionnement structure la responsabilité (CGU art. 2) et les obligations de conservation de preuves.

### 1.2 Acteurs et personnes concernées
| Acteur | Données traitées |
|---|---|
| Clients (majeurs) | identité, contact, réservations, messages, avis |
| Professionnels (12 domaines) | + profil pro, tarifs, disponibilités, portfolio, données propres au domaine, **documents de vérification** (niveaux 1–5) |
| Visiteurs | données techniques de connexion |
| Administrateurs EmiID | accès restreint et tracé (modération, litiges, vérifications) |

### 1.3 Flux de données identifiés dans le système
1. **Comptes et profils** : base de données applicative (SQLite en développement ; hébergement de production à définir).
2. **Messagerie temps réel** : service WebSocket dédié (mini-service socket.io), messages texte/audio/image stockés en base.
3. **Fonctions IA** : appel externe à l'**API Gemini (Google)** — texte du besoin (mission) et transcript vocal (recherche) ; *aucune* donnée d'identité, de messagerie ni de vérification transmise ; mode démo 100 % local sans clé API.
4. **Vérification des professionnels** : pièces justificatives consultables uniquement par les administrateurs.
5. **Sessions** : cookie de session strictement nécessaire (authentification), pas de cookie publicitaire ni traceur tiers.
6. **Localisation** : **aucune géolocalisation GPS** — seule la ville déclarée par l'utilisateur est utilisée (politique art. 8).
7. **Paiements (à venir)** : redirection vers prestataire agréé ; EmiID ne stocke ni codes secrets ni données bancaires complètes.

### 1.4 Données sensibles et mineurs
- Aucune donnée sensible (santé, origine, opinions, biométrie) n'est collectée.
- Comptes réservés aux **majeurs** ; aucune collecte de données de mineurs.
- Les documents de vérification des professionnels constituent le point de vigilance principal : accès restreint, durée limitée, proportionnalité (justification : lutte contre la fraude).

### 1.5 Rôles RGPD-assimilés (à raisonner sous droit béninois)
- **Responsable de traitement** : EmiID.
- **Sous-traitants** : hébergeur, Google (IA), FedaPay/opérateurs Mobile Money, prestataire e-mail.
- **Autorité de contrôle** : APDP (apdp.bj, numéro vert 150, siège à Cotonou).

---

## Partie II — Textes applicables (vérifiés le 14/09/2026)

### 2.1 Bénin
| Texte | Statut | Source officielle |
|---|---|---|
| **Loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin** | En vigueur | sgg.gouv.bj (Secrétariat général du gouvernement) — texte intégral également diffusé par apdp.bj / afapdp.org |
| **Loi n° 2020-35 du 6 janvier 2021 modifiant la loi n° 2017-20** | En vigueur — le Code s'entend tel que modifié | sgg.gouv.bj |

Points clés du Code pour EmiID : chapitre « protection des données à caractère personnel » (principes de licéité/finalité/proportionnalité, droits d'accès, de rectification et d'opposition, obligations de sécurité — art. 395 et s., numérotation à confirmer sur texte consolidé) ; création de l'**APDP** et de l'**ARCEP** ; répression de la cybercriminalité ; régime des transactions électroniques.

> ⚠️ **À vérifier par un avocat** : formalités préalables auprès de l'APDP (déclaration/registre/autorisation) et délais exacts de notification des violations de données.

### 2.2 UEMOA / BCEAO
| Texte | Statut | Source |
|---|---|---|
| **Règlement n° 15/2002/CM/UEMOA** relatif aux systèmes de paiement dans les États membres | En vigueur, directement applicable | bceao.int / recueils officiels |
| **Instruction n° 008-05-2015 du 21 mai 2015** fixant les conditions et modalités d'exercice des activités des émetteurs de monnaie électronique | En vigueur | bceao.int (page « Demande d'agrément / émission de monnaie électronique ») |
| Directive communautaire 2009 sur les systèmes de paiement (transposition béninoise) | **À vérifier** | — |

### 2.3 CEDEAO
| Texte | Statut | Source |
|---|---|---|
| **Acte additionnel A/SA.1/01/10 du 16 février 2010** relatif à la protection des données à caractère personnel dans l'espace CEDEAO | En vigueur | ecowas.int ; afapdp.org |
| **Révision** de cet acte — adoptée le **19 juillet 2026** (Lungi, Sierra Leone) | Adoption signalée par la presse spécialisée ; **entrée en vigueur et texte officiel : à vérifier auprès de la Commission CEDEAO** | amelegalconseils.com, cybersecuritymag.africa (processus lancé les 18–19 nov. 2024) |

### 2.4 OHADA
Actes uniformes en vigueur dans les 17 États parties, dont le Bénin : droit commercial général (statut), sociétés, **arbitrage** (clause d'arbitrage possible dans les CGU), procédures de recouvrement. Source : ohada.org / journal officiel OHADA.

### 2.5 Union africaine
**Convention de l'Union africaine sur la cybersécurité et la protection des données à caractère personnel (« Convention de Malabo »)**, adoptée le 27 juin 2014, **entrée en vigueur le 8 juin 2023** (30 jours après la 15e ratification, la Mauritanie). Source : au.int. → **État de la ratification par le Bénin : à vérifier.**

### 2.6 RGPD (UE 2016/679)
**Ne s'applique pas automatiquement au Bénin.** Applicabilité possible uniquement si EmiID propose des services à des personnes situées dans l'UE (critère du ciblage). À surveiller en cas d'extension vers la diaspora européenne. Conformément à la consigne du projet, le RGPD n'a pas servi de modèle direct à la politique de confidentialité ; seules les bonnes pratiques transposables au droit béninois ont été retenues.

### 2.7 Hiérarchie applicable à EmiID
1. **Droit béninois** : Code du numérique (2017-20 modifiée 2020-35) + textes nationaux — *normes impératives*.
2. **UEMOA** : règlements directement applicables (paiements) — *impératifs*.
3. **CEDEAO** : actes additionnels (harmonisation données personnelles) — *impératifs, opérables via les lois nationales*.
4. **OHADA** : actes uniformes (contrats) — *impératifs en matière commerciale*.
5. **International ratifié** (Malabo selon ratification) — *complémentaire*.

---

## Partie III — Politique de confidentialité (19 articles)

**Version intégrale, prête à publier** : déployée dans l'app (Footer → « Confidentialité ») — fichier source `src/lib/legal/content.ts` (`POLITIQUE_CONFIDENTIALITE`).

Structure : 1 Objet · 2 Responsable et contacts · 3 Données collectées · 4 Finalités · 5 Bases légales · 6 Personnes concernées · **7 Intelligence artificielle** (finalités, prestataire Google/Gemini, données transmises, mode démo local, limites, non-entraînement des modèles selon conditions API payantes, opt-out possible) · **8 Géolocalisation** (aucune ; ville déclarée ; consentement si future évolution) · **9 Cookies** (session strictement nécessaire ; pas de traceurs publicitaires ; logs IP 12 mois) · 10 Destinataires · 11 Sous-traitants (tableau : Google IA, hébergeur, FedaPay/opérateurs, notifications) · **12 Durées de conservation (tableau donnée/finalité/durée/justification)** · **13 Sécurité** (TLS, hachage des mots de passe, accès restreints tracés, sauvegardes, notification APDP) · **14 Droits** (information, accès, rectification, opposition, effacement, retrait du consentement) · **15 Exercice des droits** (en ligne + privacy@ ; 30 jours) · **16 Plainte APDP** (apdp.bj, numéro vert 150, siège Cotonou) · 17 Transferts internationaux (garanties, autorisation APDP le cas échéant) · 18 Modifications · 19 Contacts.

---

## Partie IV — Clauses de confidentialité (5 familles)

**Versions intégrales** : déployées dans l'app (Footer → « Partenaires ») — fichier source `src/lib/legal/content.ts` (`CLAUSES_PARTENAIRES`).

- **Clause B — Employés / collaborateurs** : besoin d'en connaître, confidentialité perpétuelle des données utilisateurs et secrets d'affaires, interdiction d'usage personnel, protection des identifiants/clés, signalement d'incident, restitution/destruction, sanctions.
- **Clause C — Fournisseurs / sous-traitants** : traitement sur instructions documentées, personnes habilitées, sécurité (chiffrement, contrôle d'accès, logs), sous-traitance ultérieure soumise à autorisation, transfert hors Bénin encadré (APDP), notification de violation **sous 48 h**, assistance aux droits des personnes, restitution/suppression en fin de contrat, audit.
- **Clause D — NDA commercial** : voir modèle signable en Partie V.
- **Clause E — Développeurs / prestataires techniques** : code source, architecture, schémas de base, API et documentation confidentiels ; interdiction de réutilisation ; gestion des secrets (coffre-fort, rotation) ; accès production journalisés ; données de test anonymisées ; restitution des accès ; **cession de PI** ; non-concurrence technique calibrée.
- **Annexe 1 — Cybersécurité (tous contrats)** : accès minimal révocable, authentification forte, TLS/chiffrement, logs 12 mois, incident signalé **sous 24 h**, sauvegardes testées, sécurité des postes, coopération (audits, APDP), sanctions.
- **Annexe 2 — IA** : finalité limitée, **interdiction d'entraîner les modèles** sur les données EmiID, prompts confidentiels, rétention ≤ 30 jours, sous-traitance IA notifiée, **human-in-the-loop** obligatoire, sécurité, audit, suppression en fin de contrat.

---

## Partie V — Accord de non-divulgation (NDA) — modèle signable

**ENTRE LES SOUSSIGNÉES :**
**EmiID** [forme juridique], RCCM [•], IFU [•], siège social à Cotonou (Bénin), représentée par [•], ci-après « la Partie 1 » ;
ET **[Nom du partenaire]**, [forme], immatriculation [•], représenté(e) par [•], ci-après « la Partie 2 » ;
ensemble « les Parties ».

**Préambule.** Les Parties souhaitent échanger des informations confidentielles en vue d'évaluer une coopération commerciale, technique ou financière (le « Projet »).

**1. Informations couvertes.** Toute information non publique transmise par une partie à l'autre, sous quelque forme que ce soit : données personnelles d'utilisateurs, chiffres et tarifs, modèle économique, documents et savoir-faire techniques, **code source, architecture, schémas de bases de données, clés et secrets API**, feuille de route, négociations.

**2. Engagements de la Partie réceptrice.** (i) utiliser les informations exclusivement pour le Projet ; (ii) limiter l'accès aux collaborateurs strictement nécessaires soumis au même niveau de confidentialité ; (iii) protéger avec au moins le même soin que ses propres informations confidentielles ; (iv) ne pas reproduire ni décompiler ; (v) notifier sans délai toute divulgation non autorisée ; (vi) ne pas déposer de droits de propriété intellectuelle dérivés sans accord écrit.

**3. Données personnelles.** Les données à caractère personnel éventuellement transmises sont traitées conformément au Code du numérique (loi n° 2017-20 du 20 avril 2018, modifiée) : finalités limitées, sécurité, assistance aux droits des personnes, restitution/suppression à la demande.

**4. Exclusions.** N'est pas confidentielle l'information : (i) déjà connue sans obligation de confidentialité ; (ii) devenue publique sans faute ; (iii) développée indépendamment (preuve à la charge du destinataire) ; (iv) légitimement reçue d'un tiers ; (v) dont la divulgation est exigée par la loi ou une autorité — notification préalable à l'autre partie dans la mesure permise.

**5. Durée.** Effet dès la signature, pour toute la durée des échanges ; obligation de confidentialité de **5 ans** après la cessation des échanges (données personnelles : aussi longtemps que l'exige le Code du numérique).

**6. Restitution.** Sur première demande, restitution ou destruction certifiée de tous supports.

**7. Absence de licence.** Aucun droit de propriété intellectuelle n'est transféré par le présent accord.

**8. Sanctions.** En cas de violation : mise en demeure, cessation, dommages-intérêts ; mesures d'urgence disponibles.

**9. Droit applicable et litiges.** Droit béninois. Résolution amiable préalable (30 jours) ; à défaut, tribunaux compétents de Cotonou **ou** arbitrage selon l'Acte uniforme OHADA relatif au droit de l'arbitrage (clause optionnelle à cocher).

Fait à Cotonou, le [•], en deux exemplaires. Signatures.

---

## Partie VI — Clauses cybersécurité (résumé exécutif)

Intégrales dans l'app (Annexe 1, onglet « Partenaires »). Cibles : tout accès interne ou externe aux systèmes EmiID.
Piliers : (1) accès minimal et révocable ; (2) authentification forte, pas de partage de comptes ; (3) chiffrement transit (TLS) et repos si possible ; (4) journalisation 12 mois ; (5) **notification d'incident sous 24 h** + coopération à la remédiation et à la notification APDP ; (6) sauvegardes testées et restauration documentée ; (7) sécurité des postes de travail ; (8) audits ; (9) sanctions (suspension des accès, résiliation faute, responsabilité pleine).
Obligations utilisateurs correspondantes : CGU art. 6 (identifiants, signalement 24 h, interdiction d'intrusion/ingénierie inverse, divulgation responsable des vulnérabilités à security@emiid.bj).

---

## Partie VII — Clauses IA (résumé exécutif)

Intégrales dans l'app (Annexe 2, onglet « Partenaires ») et côté public : politique art. 7 + CGU art. 7.
Mise en œuvre actuelle : API **Gemini (Google)** — rédaction de brouillons de missions + interprétation de recherche vocale ; texte seul transmis ; mode démo local sans clé ; brouillons toujours validés par l'humain avant publication (human-in-the-loop) ; rédaction manuelle toujours disponible (opt-out) ; pas de données de tiers ni sensibles dans les prompts.
Contractuel vis-à-vis du fournisseur : finalité limitée, interdiction d'entraînement, prompts confidentiels, rétention ≤ 30 jours, sous-traitance notifiée, audit, suppression en fin de contrat.

---

## Partie VIII — Tableau de conformité

| # | Obligation | Source légale | Exigence | Mise en œuvre EmiID | Niveau |
|---|---|---|---|---|---|
| 1 | Information des personnes | Code du numérique ; A/SA.1/01/10 | Politique claire et accessible | Politique 19 articles dans l'app, liens footer + paramètres | ✅ |
| 2 | Base légale et consentement | Code du numérique | Consentement pour fonctions facultatives | À intégrer à l'inscription (case IA + politique) | ⚠️ |
| 3 | Minimisation et finalité | Code du numérique ; A/SA.1/01/10 | Données strictement nécessaires | Champs limités au service ; IA = texte seul | ✅ |
| 4 | Sécurité des traitements | Code du numérique | Mesures techniques appropriées | TLS, hachage mots de passe, accès admin tracés ; HTTPS prod à confirmer | ✅/⚠️ |
| 5 | Droits d'accès/rectification/suppression | Code du numérique | Mécanismes effectifs | Paramètres du compte + privacy@ (30 j) | ✅ |
| 6 | Notification violation de données | Code du numérique (délais à vérifier) | Notifier APDP et personnes | Procédure à documenter (annexe 1) | ⚠️ |
| 7 | Formalités APDP (déclaration/registre) | Code du numérique (modalités à vérifier) | Accomplies avant lancement | **À faire** | ❌ |
| 8 | Contrats de sous-traitance | Code du numérique ; clauses C/E/annexes | Encadrement écrit | Contrats à signer (hébergeur, Google, FedaPay, notifications) | ❌ |
| 9 | Transferts internationaux | Code du numérique | Autorisation/garanties si requis | Transparence art. 17 ; vérification destination | ⚠️ |
| 10 | Paiements réglementés | Règl. UEMOA 15/2002 ; Instr. BCEAO 008-05-2015 | Passer par acteurs agréés | FedaPay/Mobile Money (à venir) | ℹ️ |
| 11 | Mineurs | Code du numérique ; protection enfance | Pas de collecte | Comptes majeurs uniquement | ✅ |
| 12 | Durées de conservation | Code du numérique | Durées proportionnées | Tableau art. 12 (à valider par avocat) | ⚠️ |
| 13 | Cybercriminalité (interdictions utilisateurs) | Code du numérique | CGU à jour | CGU art. 4 et 6 | ✅ |
| 14 | Contrats OHADA (PI, arbitrage) | Actes uniformes OHADA | Clauses contractuelles | Clause E (cession PI) ; CGU art. 12 ; NDA §9 | ✅/⚠️ |

Légende : ✅ conforme · ⚠️ partiel/à finaliser · ❌ à mettre en place · ℹ️ applicable à l'activation.

---

## Partie IX — Points à faire valider par un avocat

1. **Formalités APDP** applicables au lancement (déclaration préalable, registre des traitements, autorisations) et **délais exacts de notification des violations**.
2. **Articles exacts du Code du numérique** à citer dans les versions contractuelles finales (texte consolidé 2017-20 + 2020-35, disponible sur sgg.gouv.bj).
3. **Nouveau texte CEDEAO adopté le 19/07/2026** (Lungi) : entrée en vigueur, publication officielle, changements par rapport à l'A/SA.1/01/10.
4. **Ratification béninoise de la Convention de Malabo**.
5. Contrats de sous-traitance à signer sur la base des **clauses C + annexes** (hébergeur, Google/Gemini, FedaPay, e-mail) — incl. localisation des serveurs.
6. **Cession de propriété intellectuelle** formalisée pour tout développement externe (clause E).
7. **Mentions légales complètes** (dénomination, RCCM, IFU, siège) et adresses e-mail définitives (privacy@, security@).
8. **CGV** au lancement des paiements (rétractation, remboursements, litiges Mobile Money, rôles FedaPay/opérateurs).
9. **RGPD** : analyse d'applicabilité si ciblage d'utilisateurs situés dans l'UE (diaspora).
10. Validation des **durées de conservation** (prescriptions, obligations comptables).
11. **Modération des avis et contenus** (diffamation, droit à l'image, procédure contradictoire).
12. **Base légale de la vérification d'identité** des professionnels et proportionnalité des documents exigés.
13. Désignation éventuelle d'un **délégué à la protection des données** et registre des accès administrateurs.
14. Clause d'**arbitrage OHADA** vs tribunaux de Cotonou selon les profils (B2C/B2B).

---

*Document généré le 14/09/2026. Sources primaires : sgg.gouv.bj (lois 2017-20 et 2020-35), apdp.bj / service-public.bj (APDP, plaintes, numéro vert 150), bceao.int (Instruction 008-05-2015), au.int (Convention de Malabo, en vigueur 08/06/2023), ecowas.int / afapdp.org (Acte A/SA.1/01/10). Ce dossier ne constitue pas un avis juridique.*
