# PARTIE IX — Points à faire valider par un juriste

> Ce dossier a été préparé avec la plus grande rigueur documentaire, sur la base des textes officiels consultés le 14 septembre 2026. **Il ne remplace pas la consultation d'un conseil juridique béninois.** Les points ci-dessous doivent impérativement être validés ou complétés avant publication des documents et mise en production.

## 1. Identité et responsabilité

| # | Point | Pourquoi |
|---|---|---|
| 1.1 | Choix de la **forme juridique** (SARL/SAS/…), dénomination, RCCM Cotonou, IFU, domiciliation | Article 2 de la politique ; responsabilité du responsable de traitement |
| 1.2 | Qualification d'**unique responsable** vs **responsables conjoints** si des co-fondateurs accèdent aux données (art. 388) | Articulation des obligations entre dirigeants/administrateurs |
| 1.3 | Statut exact des **professionnels** (indépendants, entreprises, associations… selon les 12 domaines d'activité) et des **commissions éventuelles** : relations B2B et droit de la consommation | CGU ; à préciser lors de l'arrivée des paiements |

## 2. Formalités APDP

| # | Point | Pourquoi |
|---|---|---|
| 2.1 | Préparation et dépôt de la **déclaration préalable** (art. 405) : périmètre exact des traitements, normes de simplification applicables | Obligatoire avant mise en production ; le formulaire et la procédure actuels de l'APDP sont à confirmer directement auprès de l'autorité |
| 2.2 | **Demande d'autorisation de transfert** (art. 407 6°) : hébergeur retenu + API Gemini (Google, USA) ; appréciation du « niveau de protection équivalent » (art. 391) | Appréciation discrétionnaire de l'APDP ; alternatives possibles (hébergement local) à arbitrer avec elle |
| 2.3 | **AIPD** (art. 428) : liste officielle des traitements à risque élevé publiée par l'APDP ? La messagerie + IA l'exigent-elles formellement ? | La liste des catégories relevant de l'autorisation (art. 407) et de l'AIPD relève de l'autorité |
| 2.4 | **DPO** (art. 430) : le « suivi régulier et systématique à grande échelle » est-il atteint au lancement ? Désignation volontaire pour bénéficier de l'exemption (art. 408) ? | Appréciation de seuil à valider |
| 2.5 | Coordonnées officielles de l'**APDP** (adresse, e-mail, téléphone, procédure de réclamation) à reprendre du site officiel | Article 16 de la politique — ne pas inventer de coordonnées |

## 3. Textes et versions

| # | Point | Pourquoi |
|---|---|---|
| 3.1 | **Version consolidée du Code du numérique** intégrant la loi n° 2020-35 du 06/01/2021 — faire vérifier qu'aucune autre modification n'est intervenue depuis (les recherches de septembre 2026 n'en ont pas révélé, mais une vérification SGG est requise) | Les articles cités (377-443, 452-459…) doivent être lus dans la version en vigueur |
| 3.2 | **Numéros exacts des 8 décrets d'application du 2 juillet 2025** (notamment cryptologie et interception/accès aux données) et leur effet sur l'usage TLS/SQLCipher | L'obligation de déclaration de cryptologie dépend des caractéristiques retenues |
| 3.3 | **Code de la consommation** : numéro, date de promulgation et articles applicables aux services à distance (le Code a été adopté en Conseil des ministres le 3 mai 2023 ; le texte final promulgué est à vérifier) | Article cité dans la Partie II §1.3 sans numéro, volontairement |
| 3.4 | **Code de l'enfant** : date officielle exacte de la loi n° 2015-08 (23 janvier 2015 selon certains fonds ; 8 décembre 2015 selon d'autres) | Exactitude des citations |
| 3.5 | **Révision CEDEAO adoptée le 19/07/2026 à Lungi** : texte définitif dès sa publication au Journal officiel de la Communauté (amendes 5 % CA, 72 h, portabilité, profilage, mineurs) ; calendrier de transposition (3 ans) | Mettre à jour la politique/clauses si l'acte final diffère |
| 3.6 | **Directive UEMOA sur les services de paiement par système mobile** : référence exacte à confirmer auprès de la Commission de l'UEMOA | Cité dans la Partie II §2 avec réserve |
| 3.7 | **Convention de Malabo (UA)** : statut de ratification par le Bénin | Partie II §4 |
| 3.8 | Existence d'un **régime béninois spécifique « cookies »** (à défaut : application du droit commun des données) | Article 9 de la politique |
| 3.9 | Durées de conservation suggérées (Article 12) : confrontation aux **délais de prescription** applicables (droit commun béninois / OHADA) | Les durées 3 ans / 12 mois sont des propositions à caler juridiquement |

## 4. Contrats et documents

| # | Point | Pourquoi |
|---|---|---|
| 4.1 | **Rédaction complète des CGU/CGV** (usage, contenus, avis, suspension, litiges, médiation, droit applicable, tribunal compétent) — hors périmètre de ce dossier | Complément indispensable de la politique |
| 4.2 | Validation des **clauses de confidentialité** (Partie IV) et du **NDA** (Partie V) au regard du droit commun des obligations béninois et OHADA (validité, preuve, pénalités) | Modèles préparatoires |
| 4.3 | **Clause de non-sollicitation post-emploi** (Partie IV.B.7) : licéité et durée au regard du droit du travail béninois | Risque de clause abusive |
| 4.4 | **Contrat avec Google** (API Gemini) : acceptation des conditions, choix du compte payant, vérification des engagements de non-entraînement et des durées de rétention en vigueur à la date de signature | Les conditions des fournisseurs évoluent fréquemment |
| 4.5 | **Contrat d'hébergement** : intégration des clauses VI.3, DPA (confidentialité, incidents 24 h, restitution/suppression, audit), localisation exacte des données et sauvegardes | Le choix d'hébergeur conditionne le dossier APDP |
| 4.6 | **Médiation des litiges** : encadrement contractuel du rôle de l'administrateur (neutralité, traçabilité, confidentialité de ce qu'il voit) | Fonction sensible du produit ; à refléter dans les CGU |

## 5. Conformité produit (à arbitrer avec l'équipe)

| # | Point | Pourquoi |
|---|---|---|
| 5.1 | **Suppression de compte, export/portabilité, oubli numérique** : choix d'implémentation (auto-service immédiat vs demande traitée sous 45 jours) | Articles 441/443 du Code ; effort produit |
| 5.2 | **Vérification d'identité des professionnels** : si dépôt de documents (CNI/passeport), définir stockage chiffré, accès nominatif, suppression sous 90 jours, et mention spécifique à la collecte | Données à haut risque |
| 5.3 | **Recherche vocale** : avertir l'utilisateur, selon le navigateur, que la voix peut être traitée par le fournisseur du navigateur (ex. Google/Chrome) ; alternative : transcription 100 % locale si exigible | Article 7 de la politique |
| 5.4 | **Paiements Mobile Money** : avant lancement, re-vérifier la conformité (aucune détention de fonds ; rôles de chaque acteur ; fiscalité des transactions) avec le conseil | UEMOA/BCEAO/OQSF ; évolution du modèle à risque |
| 5.5 | **Mineurs** : mécanisme de vérification d'âge (déclaration ?) et mention dans l'écran d'inscription | Article 17 |
| 5.6 | **Fiscalité et facturation** des services vendus via la plateforme (TVA, timbre, obligations du professionnel vs de la plateforme) | Hors périmètre du présent dossier |

## 6. Récapitulatif des mentions « À vérifier » disséminées dans le dossier

- Coordonnées APDP (Article 16) — site officiel.
- Niveau API Gemini retenu et confirmation de l'exclusion d'entraînement (Article 7, Partie VII.3).
- Hébergeur et pays d'hébergement (Articles 2, 10, 11).
- Mesures à confirmer : mot de passe haché, chiffrement au repos, sauvegardes chiffrées (Article 13).
- Numéro d'extrait de déclaration APDP à insérer dès obtention (Article 11).
- Dates/numéros exacts : Code de la consommation (2023), Code de l'enfant (2015), décrets du 02/07/2025, directive UEMOA mobile money, convention de Malabo.
- Texte définitif de la révision CEDEAO (publication J.O. communautaire attendue).

---

**Recommandation finale** : confier ce dossier (Parties I à IX) à un avocat béninois spécialisé en droit du numérique, idéalement référencé auprès de l'APDP, pour : (1) finaliser la déclaration + autorisation de transfert, (2) valider la politique avant publication, (3) signer les contrats hébergeur/IA/collaborateurs, (4) rédiger les CGU/CGV, et (5) instituer une revue annuelle de conformité (suivi notamment de la révision CEDEAO).
