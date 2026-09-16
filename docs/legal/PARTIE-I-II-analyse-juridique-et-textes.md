# PARTIE I — Analyse juridique du projet EmiID
# PARTIE II — Textes juridiques applicables

> Document de travail — rédigé le 14 septembre 2026 — à valider par un conseil juridique (Partie IX).

---

# PARTIE I — Analyse juridique du projet

## 1. Fonctionnement du projet

**EmiID** est une plateforme de mise en relation (marketplace) entre des clients et des professionnels vérifiés, basée à Cotonou (Bénin), couvrant 12 domaines d'activité (artisan, commerçant, freelance, entreprise, agence, startup, ONG/association, investisseur, institution publique, étudiant, école/centre de formation, en recherche d'opportunités). Les utilisateurs y trouvent des professionnels par domaine, spécialité et ville, consultent leurs portfolios (bio, services, réalisations, avis, contacts, et les informations propres à leur domaine d'activité), réservent des offres (séances, packs, ateliers), publient ou candidatent à des missions courtes, échangent via une messagerie temps réel, et peuvent ouvrir un litige en cas de désaccord, résolu par une médiation de l'administrateur.

**Rôles d'utilisateurs** (définis dans la base de données) :
1. **Client** : recherche un professionnel, réserve une offre, publie une mission, échange par messagerie, laisse un avis après une séance terminée ;
2. **Professionnel** : crée un profil pro dans l'un des 12 domaines d'activité (bio, spécialités, offres, disponibilités, portfolio, contacts, données propres au domaine), gère ses réservations, candidature aux missions, peut être parrainé par un autre professionnel ;
3. **Administrateur** : gère les utilisateurs, les vérifications, les réservations, les missions, les avis, les litiges (médiation dans la conversation), et consulte un journal de toutes ses actions.

**Traitements réalisés par la plateforme** :
- gestion de comptes et de profils (dont profil public consultable sans compte) ;
- mise en relation et réservation d'offres (prix en FCFA/XOF ; **aucun paiement en ligne n'est traité par la plateforme à ce jour** — les paiements prévus passeront par des opérateurs Mobile Money agréés BCEAO, cf. Partie II § UEMOA) ;
- messagerie temps réel entre client et professionnel (texte, photos, messages vocaux, citations, réactions) avec **intervention possible de l'administrateur en cas de litige** ;
- vérification des professionnels (types : identité, document, certification, référence) ;
- avis vérifiés (liés à une réservation) ;
- notifications internes (aucun envoi d'e-mails de prospection à ce jour) ;
- journalisation des actions d'administration ;
- deux fonctions d'**intelligence artificielle** : (a) rédaction assistée d'un brouillon de mission à partir du texte dicté/saisi par l'utilisateur ; (b) interprétation d'une recherche vocale pour pré-filtrer les professionnels.

## 2. Cartographie des données personnelles collectées

### 2.1 Données d'identité et de contact
| Donnée | Source | Champs |
|---|---|---|
| Adresse e-mail | fournie par l'utilisateur (obligatoire) | `Profile.email` |
| Nom complet | fournie (facultatif) | `Profile.fullName` |
| Ville | fournie (facultatif) | `Profile.city`, `Mission.city` |
| Photo de profil / couverture | fournie | `Profile.avatarUrl`, `ProfessionalProfile.coverUrl` |
| Numéro de téléphone / WhatsApp | fournie (facultatif, affichée publiquement sur le portfolio à la demande du professionnel) | `ProfessionalProfile.phone`, `.whatsapp` |
| Site web, adresse courte (quartier), réseaux sociaux | fournie (facultatives, publiques) | `ProfessionalProfile.website`, `.address`, `.socialLinks` |

### 2.2 Données professionnelles
Headline, bio, années d'expérience, langues parlées, domaine d'activité (l'un des 12 domaines EmiID) et spécialités, offres (titre, description, prix, durée), disponibilités (créneaux), réalisations de portfolio (titres, descriptions, images, liens projets, année), statistiques (sessions complétées, note moyenne, niveau de vérification 0–5), ainsi que les données flexibles propres au domaine déclaré (`domainData` : horaires/catalogue, pitch/équipe, mission, thèse d'investissement, parcours, selon le domaine).

### 2.3 Données transactionnelles
Réservations (titre, date/heure programmée, durée, montant, statut : en attente / confirmée / terminée / annulée, note), missions (titre, description, budget, échéance, statut), candidatures aux missions (prix proposé, message, statut), parrainages (parrain/filleul/catégorie/statut). **Aucune donnée de carte bancaire ni d'identifiant de paiement n'est stockée** ; les montants sont purement indicatifs jusqu'à la mise en place des paiements Mobile Money (traités par les établissements de monnaie électronique agréés, jamais par EmiID).

### 2.4 Contenus de communication (données à risque élevé)
- **Messages** : texte (≤ 4 000 caractères), **photos** (compressées côté navigateur à 1 280 px max, JPEG), **messages vocaux** (audio ≤ 60 s, encodé dans la base), citations (réponse à un message), réactions emoji, marqueurs de lecture (par rôle).
- **Litiges** : motif (catégorie parmi 5), description libre, décision de médiation.
- ⚠️ Le **contenu des conversations est par nature susceptible de révéler des informations personnelles** (santé, situation familiale, professionnelle…), même si EmiID ne les demande pas. C'est la donnée la plus à risque du projet → chiffrement du support de stockage, accès administratif restreint et justifié (médiation uniquement), durée de conservation limitée (cf. Article 12 de la politique).

### 2.5 Données de vérification
Type de demande (identité, document, certification, référence), statut (en attente/approuvée/rejetée), note interne de l'administrateur. ⚠️ Si le futur formulaire de dépôt permet d'envoyer une **copie de pièce d'identité**, ces documents devront être traités comme des données de très haute sensibilité (stockage chiffré, accès restreint, suppression après vérification) — cf. Partie IX.

### 2.6 Données techniques et de session
- **Cookie de session** `emiid_uid` (httpOnly) : identifie le compte actif — nécessaire au fonctionnement ;
- stockage local du navigateur : préférences d'interface, compte actif de démonstration ;
- **présence en ligne** : horodatage de connexion/déconnexion au service temps réel (socket) pour afficher « en ligne » / « vu à HH:MM » ;
- **indicateur « en train d'écrire… »** (transitoire, non stocké) ;
- journaux serveur (traçabilité technique ; ne stockent pas d'IP en base de données).

### 2.7 Données envoyées aux services d'IA
- **Rédaction de mission (API Gemini de Google)** : le texte de mission saisi ou dicté par l'utilisateur + une consigne système. Aucun identifiant ni profil utilisateur n'est transmis.
- **Recherche vocale** : la **transcription** du texte parlé (obtenue via l'API Web Speech du navigateur) est envoyée à l'API Gemini pour extraction des filtres (ville, spécialité…). ⚠️ Selon le navigateur, la reconnaissance vocale elle-même peut s'effectuer sur les serveurs du fournisseur du navigateur (ex. Google pour Chrome) — cf. Article 7 de la politique.

## 3. Données sensibles ou à risque

| Catégorie | Présence | Analyse |
|---|---|---|
| Données sensibles au sens de l'art. 394 du Code du numérique (origine, opinions politiques, religion, syndicat, génétique, biométrie, santé, vie sexuelle) | **Non collectées par EmiID** | Le service ne demande aucune de ces données. Risque résiduel : contenu libre des messages — traité par des mesures de sécurité renforcées (art. 402) plutôt que par une autorisation préalable. |
| Documents d'identité (si dépôt de vérification) | À venir | Données à haut risque : chiffrer, limiter l'accès, supprimer après décision. |
| Données financières / carte bancaire | Non | EmiID ne traite pas de paiement ; données détenues par les établissements de monnaie électronique agréés (BCEAO). |
| Données de mineurs | Non (service non destiné aux mineurs) | Cf. Article 17 de la politique. |
| Géolocalisation | Non | Seule une **ville déclarative** est collectée ; aucune géolocalisation technique (GPS, IP → position). |

## 4. Finalités et bases juridiques (art. 389 du Code du numérique)

| Finalité | Traitement | Base juridique (art. 389) |
|---|---|---|
| Création et gestion du compte | e-mail, profil, session | **Consentement** (inscription volontaire) + exécution du contrat d'utilisation |
| Mise en relation et réservations | offres, disponibilités, réservations, avis | **Exécution du contrat** auquel la personne est partie |
| Messagerie client ↔ professionnel | conversations, messages, médias | **Exécution du contrat** (conversation liée à une réservation/mission) + consentement pour les médias (photos, vocaux) |
| Sécurité et confiance de la plateforme | vérification des professionnels, journal d'administration, modération | **Intérêts légitimes** (prévention de la fraude et des abus) |
| Médiation des litiges | accès admin à la conversation, décision | **Intérêts légitimes** + exécution des CGU ; conservation : **obligation légale** possible (preuve) |
| Rédaction de mission par IA | envoi du texte à l'API Gemini | **Consentement** (activation explicite par l'utilisateur) |
| Recherche vocale | transcription → Gemini | **Consentement** (activation par bouton micro) |
| Notifications internes | messages de service | **Exécution du contrat** |
| Prospection commerciale par e-mail | — | **Non pratiquée à ce jour** ; si elle le devient : consentement préalable obligatoire (art. 400 du Code, renvoyant à l'art. 332 : prospection directe) |

## 5. Personnes concernées

Clients, professionnels (12 domaines d'activité), administrateurs de la plateforme. **Tiers indirects** : toute personne citée dans un message, une mission ou un avis ; une personne dont la photo serait publiée dans un portfolio (le professionnel publie les réalisations sous sa responsabilité — clause prévue dans les CGU et le droit à l'oubli numérique de l'art. 443 du Code du numérique).

## 6. Destinataires et sous-traitants

| Destinataire | Rôle | Données |
|---|---|---|
| Personnel autorisé d'EmiID | administration, médiation, support | selon les besoins (accès nominatif, journalisé) |
| **Hébergeur** [À compléter : nom, pays] | hébergement du site et de la base | l'ensemble des données |
| **Google LLC (API Gemini)** | sous-traitant IA ponctuel | texte de mission / transcription de recherche vocale uniquement |
| **Fournisseur du navigateur** (ex. Google pour Chrome) | reconnaissance vocale Web Speech | audio de la recherche vocale, côté client |
| **Établissements de monnaie électronique agréés** (à venir : MTN MoMo, Moov Money, etc.) | paiement Mobile Money | aucune donnée transférée par EmiID : le client paie directement l'opérateur |
| Autorités judiciaires / administratives | réquisition légale | données strictement nécessaires |

## 7. Transferts hors du Bénin

**Constat** : l'infrastructure actuelle est hébergée hors du Bénin [À compléter : pays de l'hébergeur], et l'API Gemini est opérée par Google (États-Unis). Or :
- **art. 391** du Code du numérique : un transfert vers un État tiers suppose que l'Autorité (APDP) constate un **niveau de protection équivalent** ;
- **art. 407 (6°)** : le transfert vers un État tiers figure parmi les traitements **subordonnés à l'autorisation préalable de l'APDP**.

**Conséquence obligatoire pour EmiID** : (1) choisir un hébergeur et le déclarer ; (2) déposer une demande d'autorisation de transfert auprès de l'APDP avant mise en production, ou privilégier un hébergement au Bénin ; (3) contractualiser avec Google un encadrement de type sous-traitance (conditions API + compte payant pour exclure l'usage des données pour l'entraînement) ; (4) minimiser les données envoyées à l'IA. Cf. tableau de conformité (Partie VIII).

## 8. Durées de conservation

Proposition détaillée dans l'Article 12 de la politique de confidentialité. Principe (art. 433) : pas de conservation au-delà des finalités ; les données de conversation sont supprimées à la demande de l'utilisateur ou 12 mois après la clôture, sauf litige ouvert (conservé jusqu'à la résolution + 3 ans, pour la preuve).

## 9. Mesures de sécurité (art. 424 et 426 du Code du numérique)

Déjà en place : chiffrement TLS en transit, cookie de session httpOnly, contrôle d'accès par rôle côté serveur (les données d'un utilisateur ne sont accessibles qu'au titulaire, à l'administrateur et aux parties de la conversation), journalisation des actions d'administration (table `AdminAction`), validation stricte des entrées (taille des médias limitée à ~1,6 Mo, messages ≤ 4 000 caractères), jeton interne pour le service temps réel, compression des images côté navigateur avant envoi.

À compléter : chiffrement au repos de la base (cf. Partie VIII), gestion des sauvegardes chiffrées, procédure formalisée de notification de violation (art. 427 : **sans délai à l'APDP et à la personne concernée**), limitation de débit (anti-abus).

> **MàJ 14/09/2026** : l'authentification est désormais **par fournisseur uniquement** (Google, LinkedIn, Apple — OAuth 2.0 / OpenID Connect via NextAuth). Aucun mot de passe n'est stocké ; la politique de mot de passe et la réinitialisation sécurisée ne sont plus applicables côté EmiID (déléguées aux fournisseurs).

## 10. Obligations du responsable du traitement (résumé)

Art. 405 (déclaration préalable APDP), 407 (autorisation : transferts, décisions automatisées), 415-418 (information), 419-422 (facilitation des droits, réponse ≤ 30 jours), 424 (privacy by design/default), 425 (confidentialité du personnel), 426-427 (sécurité + notification des violations), 428 (analyse d'impact si risque élevé), 430 (DPO dans les cas visés), 433 (conservation), 435 (registre des traitements), 437-443 (droits), 452-459 (sanctions : mise en demeure, sanction pécuniaire ≤ 50 000 000 FCFA au premier manquement, publication).

---

# PARTIE II — Textes juridiques applicables

## 1. Droit béninois (source prioritaire)

### 1.1 Loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin
- **Référence** : Loi n° 2017-20 du 20 avril 2018 (Assemblée nationale, séance du 13 juin 2017 ; déclarée conforme par les décisions DCC 17-223 du 02/11/2017 et DCC 18-019 du 22/03/2018).
- **Statut** : **en vigueur**, telle que **modifiée par la Loi n° 2020-35 du 06 janvier 2021** (source officielle : Secrétariat général du Gouvernement — sgg.gouv.bj). Les textes réglementaires récents (ex. arrêtés ARCEP 2025) visent expressément la loi « telle que modifiée » : c'est donc la version consolidée qu'il faut appliquer.
- **Portée** : code unique regroupant communications électroniques, écrit et outils électroniques, services de confiance, commerce électronique, protection des données, cybercriminalité/cybersécurité. Elle abroge et remplace les anciennes lois de 2006-2007 (dont la loi n° 2006-09 sur la protection des données), désormais sans objet.
- **Articles pertinents pour EmiID** (vérifiés dans le texte officiel) :

| Article(s) | Objet | Portée pour le projet |
|---|---|---|
| 379–381 | Objet, champ matériel et **territorial** | Le Livre V s'applique aux traitements effectués dans le cadre des activités d'un responsable établi au Bénin, et aussi, hors Bénin, aux données de personnes se trouvant au Bénin (offre de biens/services) |
| 382, 410 | Exclusions et dispenses | Dispense notamment comptabilité, paie, gestion fournisseurs — **pas** notre activité principale |
| 388 | Responsables conjoints | Articulation des rôles si co-traitement |
| **389** | Consentement et légitimité | Bases légales : consentement ; obligation légale ; mission d'intérêt public ; exécution du contrat / mesures précontractuelles ; sauvegarde d'intérêts |
| 391–392 | Transferts vers un État tiers | Niveau de protection **équivalent** apprécié par l'APDP |
| **394–397** | Données sensibles | Interdiction de principe (origine, opinions, religion, syndicat, génétique, biométrie, santé, vie sexuelle) sauf exceptions (consentement explicite…) ; traitement soumis à **autorisation** |
| 399 | Anonymisation | Possibilité de traiter sans identification |
| **400** (+ 332) | Prospection directe | Interdiction de prospection directe sans le régime approprié ; droit d'être informé avant toute première transmission à des tiers à des fins de prospection |
| 402–404 | Mesures supplémentaires (données sensibles) | Accès limité, obligations de confidentialité contractuelles du personnel |
| **405–406** | **Déclaration préalable** | Obligation de déclarer à l'APDP tout traitement avant mise en œuvre (normes de simplification possibles) |
| **407** | **Autorisation préalable** | Données sensibles ; identifiants nationaux ; biométrie ; interconnexion de fichiers ; **transferts vers un État tiers** ; traitements automatisés excluant une personne d'un droit/prestation/contrat |
| 408–413 | Exemptions, contenu des demandes, délais | Réponse de l'APDP sous 60 jours (+30) ; **silence = accord** ; demande possible par voie électronique |
| **415–418** | Obligation d'information | Identité du responsable, DPO, finalités, catégories, destinataires, transferts, durée, droits — information concise, claire, gratuite |
| 419–422 | Exercice des droits | Facilitation ; **réponse sous 30 jours** ; gratuité ; vérification d'identité |
| 424 | Privacy by design / by default | Pseudonymisation, minimisation dès la conception |
| 425 | Confidentialité | Traitement par des personnes agissant sous l'autorité du responsable |
| **426–427** | Sécurité / notification | Mesures techniques et organisationnelles ; **notification sans délai à l'APDP ET aux personnes** en cas de rupture de sécurité |
| 428–429 | Analyse d'impact (AIPD) | Obligatoire avant tout traitement à risque élevé |
| 430–432 | Délégué à la protection des données (DPO) | Obligatoire notamment si suivi régulier et systématique à grande échelle |
| **433** | Conservation | Pas de conservation au-delà des finalités |
| 434–435 | Pérennité ; **registre des activités de traitement** | Registre obligatoire |
| **437** | Droit d'accès | Accès au traitement et aux données |
| **438** | **Portabilité** | Récupération dans un format structuré et lisible par machine |
| 439 | Interrogation | Droit d'interroger les services de traitement |
| **440** | **Opposition** | Opposition pour motifs légitimes ; information préalable à la prospection |
| **441** | **Rectification et suppression** | Réponse sous **45 jours** ; demande par voie postale **ou électronique** |
| **443** | **Droit à l'oubli numérique** | Effacement des liens/copies de données publiées |
| 452–459 | Sanctions | Avertissement, mise en demeure, sanction pécuniaire (≤ **50 000 000 FCFA** au premier manquement), publication, recours administratif |
| 464 | Composition de l'APDP | Autorité indépendante (11 membres) |
| 502 et s. | Sanctions pénales | Infractions en matière de données / cybersécurité |
| Livre IV (ex. art. 332) | Commerce électronique | Définition de la prospection directe ; obligations d'information précontractuelle du fournisseur en ligne ; protection du consommateur |
| Livre VI | Cybercriminalité / cybersécurité | Encadrement des atteintes aux STAD, obligation de sécuriser, coopération avec les autorités |

### 1.2 Décrets d'application récents
- **8 décrets d'application du Code du numérique adoptés en Conseil des ministres le 2 juillet 2025** (dont : modalités de déclaration, d'autorisation et d'agrément des moyens et services de **cryptologie** ; règles d'interception et d'accès aux données ; prestataires d'archivage électronique ; identification électronique). → **Impact EmiID** : l'usage du chiffrement TLS est un usage courant ; une **déclaration de cryptologie** peut être requise selon les caractéristiques des moyens employés — *à vérifier auprès de l'ANSSI Bénin / de l'APDP*.

### 1.3 Autres textes béninois
| Texte | Pertinence |
|---|---|
| **Loi n° 2015-08 portant Code de l'enfant en République du Bénin** (2015 — date précise de promulgation à vérifier auprès du SGG) | Protection des mineurs ; service non destiné aux mineurs (cf. Article 17) |
| **Code de la consommation** adopté en Conseil des ministres le **3 mai 2023** (numéro et date de promulgation à vérifier auprès du SGG) | Droits du consommateur dans les relations à distance / e-commerce ; renforce les obligations d'information du Livre IV du Code du numérique |
| Réglementation des finances électroniques / bancaire (Bénin + BCEAO) | S'appliquera uniquement via les **opérateurs de paiement agréés** — EmiID n'ayant pas vocation à détenir des fonds (cf. § UEMOA) |
| Règles de politique de protection des infrastructures d'information critiques (Conseil des ministres du 22 février 2023) + Agence Nationale de la Sécurité des Systèmes d'Information (**ANSSI Bénin**) | Cadre de sécurité nationale ; EmiID n'est pas une infrastructure critique, mais l'ANSSI est l'interlocuteur pour la cryptologie et les incidents |

## 2. Droit UEMOA

| Texte | Statut | Articulation |
|---|---|---|
| **Règlement n° 15/2002/CM/UEMOA du 19 septembre 2002 relatif aux systèmes de paiement dans les États membres** | En vigueur | Règlement communautaire directement applicable ; encadre les systèmes de paiement. **EmiID ne devient jamais un système de paiement** : à l'arrivée des paiements, les clients paient les professionnels via des établissements de monnaie électronique **agréés par la BCEAO** (MTN, Moov…). EmiID n'intermédie pas les fonds. |
| **Instruction BCEAO n° 008-05-2015 du 8 mai 2015** fixant les conditions et modalités d'exercice des activités des émetteurs de monnaie électronique | En vigueur | Définit les acteurs (émetteur, distributeur…) et leurs obligations (dont KYC et confidentialité des données du portefeuille électronique). Concernent les **opérateurs agréés**, pas EmiID ; la plateforme devra seulement éviter de stocker des identifiants de paiement inutiles. |
| Directive UEMOA sur les services de paiement par système mobile (2011) | Référence exacte **à vérifier** auprès de la Commission de l'UEMOA | Même articulation : obligations des prestataires de paiement agréés. |

**Conclusion UEMOA** : tant qu'EmiID ne détient aucun fonds et ne traite aucun paiement, les textes UEMOA s'appliquent **indirectement** (par les partenaires de paiement). Si le modèle évoluait vers une intermédiation des paiements (commission déduite, escrow), une analyse spécifique BCEAO/OQSF (lutte contre le blanchiment) deviendrait nécessaire — cf. Partie IX.

## 3. Droit CEDEAO

| Texte | Statut | Articulation |
|---|---|---|
| **Acte additionnel A/SA.1/01/10 du 16 février 2010 relatif à la protection des données à caractère personnel dans l'espace CEDEAO** | En vigueur (applicable aux États membres) | Matrice des lois nationales ; impose législation nationale + autorité indépendante (d'où l'APDP). Articles notables : art. 35 (interdiction des décisions fondées sur le seul traitement automatisé donnant des effets juridiques), art. 41 (rectification/destruction). Le droit béninois (Code du numérique) est **plus détaillé et plus exigeant** : c'est lui qui s'applique en pratique, l'acte CEDEAO servant de plancher commun. |
| **Révision de l'acte additionnel — adoptée le 19 juillet 2026 à Lungi (Sierra Leone), 69e session ordinaire de la Conférence des chefs d'État et de Gouvernement** | **Adoptée mais PAS ENCORE EN VIGUEUR** : le texte n'a pas encore été publié au Journal officiel de la Communauté ; mise en conformité nationale prévue sur 3 ans | Refonte avec : extraterritorialité, principes explicites (finalité, minimisation, durée…), **notification des violations sous 72 h**, **portabilité**, droit à la limitation, oubli numérique, consentement des mineurs (autorité parentale), **profilage soumis à autorisation**, DPO, registre, AIPD, amendes jusqu'à **5 % du chiffre d'affaires**, réseau régional des autorités. → **À surveiller** : la version définitive pourra ajuster certaines obligations ; aucune action immédiate requise au-delà de la conformité au Code du numérique, qui couvre déjà l'essentiel. |
| **Directive C/DIR/1/08/11 portant lutte contre la cybercriminalité** | En vigueur | Harmonisation pénale régionale ; recoupée par le Livre VI du Code du numérique. |
| Instruments communautaires adoptés en juillet 2026 (communiqué final § 33 : cybersécurité, gouvernance numérique, communications électroniques, données ouvertes, itinérance + mécanisme régional de coordination en cybersécurité) | Publication à venir | À surveiller pour la cybersécurité (coordination avec l'ANSSI Bénin). |

## 4. Autres normes pertinentes

| Cadre | Applicabilité à EmiID |
|---|---|
| **OHADA** (Actes uniformes, directement applicables) | Pas d'acte uniforme sur les données personnelles. Pertinents : **Acte uniforme relatif au droit commercial général** (contrats commerciaux, notamment validité et preuve des clauses de confidentialité) et, selon la forme juridique retenue, **Acte uniforme relatif au droit des sociétés commerciales et du GIE**. Les clauses des Parties IV à VII reposent sur le droit commun des obligations, complété par l'art. 425 du Code du numérique pour la confidentialité des données. |
| **Convention de l'Union africaine sur la cybersécurité et la protection des données (Malabo, 2014)** — en vigueur depuis juin 2023 | Convention internationale ; le **statut de ratification par le Bénin est à vérifier** auprès du ministère des Affaires étrangères. Influence de principe uniquement. |
| **RGPD (UE)** | **Non applicable de plein droit** au Bénin. Il ne le deviendrait que si EmiID offre des biens/services à des personnes situées dans l'UE ou suit leur comportement (art. 3 RGPD) — ex. ciblage explicite de la diaspora en Europe. Aucune obligation aujourd'hui ; vigilance si le marché s'élargit. |

## 5. Hiérarchie et articulation des textes

```
Constitution du Bénin (vie privée, art. 15)
   │
   ├─ CEDEAO — droit communautaire (acte additionnel 2010 ; révision 2026 à venir)
   │       ↳ sert de plancher ; prime dans son domaine, mais le Code du numérique est
   │         plus détaillé → en pratique, appliquer le Code du numérique
   │
   ├─ UEMOA — règlements/directives paiement (BCEAO)
   │       ↳ s'appliquent indirectement via les opérateurs Mobile Money agréés
   │
   ├─ OHADA — actes uniformes (contrats, sociétés)
   │       ↳ applicable aux clauses contractuelles et à la forme juridique
   │
   └─ LOI N° 2017-20 MODIFIÉE (CODE DU NUMÉRIQUE) + décrets d'application 2025
           ↳ TEXTES DIRECTEMENT OBLIGATOIRES POUR EMIID (Livre V = cœur de la conformité)
             └─ Délibérations/déclarations APDP (formalités)
                └─ CGU, politique de confidentialité, contrats (mise en œuvre)
```

**Répartition entre documents :**
- **Politique de confidentialité** (Partie III) : informations obligatoires des art. 415-416 (identité, finalités, bases, destinataires, transferts, durées, droits, réclamations APDP) ;
- **CGU** : usage de la plateforme, contenus, comptes, suspension, litiges, avis, mineurs, droit applicable/tribunaux ;
- **Contrats / clauses** (Parties IV à VII) : confidentialité (art. 425), sous-traitance (encadrement des prestataires : hébergeur, Google), cybersécurité (art. 426-427), IA ;
- **Réglementaire (hors documents publics)** : déclaration APDP (art. 405), autorisations (art. 407), registre (art. 435), AIPD (art. 428), procédure incident (art. 427).

---

*Prochaine étape : PARTIE III — Politique de confidentialité.*
