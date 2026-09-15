# PARTIE VIII — Tableau de conformité

> État des lieux au **14 septembre 2026**, établi à partir de l'analyse du code du projet (Partie I) et des textes applicables (Partie II).
> Légende : ✅ Conforme · ⚠️ À compléter · ❌ Non conforme · ℹ️ Non applicable (aujourd'hui)

## 1. Formalités préalables et gouvernance (APDP)

| Obligation | Source juridique | Article | Exigence | Mise en œuvre dans le projet | Niveau |
|---|---|---|---|---|---|
| Déclaration préalable des traitements | Code du numérique (loi 2017-20 modifiée) | 405, 409, 412 | Déclarer tout traitement à l'APDP avant mise en œuvre | **Non effectué** — dossier de déclaration à préparer (identité responsable, finalités, catégories, durées) | ❌ |
| Autorisation pour transferts hors Bénin | Code du numérique | 391, 407 (6°) | Autorisation préalable de l'APDP pour transfert vers État tiers | Hébergement hors Bénin [À confirmer] + API Gemini (USA) : demande d'autorisation à déposer | ❌ |
| Registre des activités de traitement | Code du numérique | 435 | Tenue d'un registre (responsable, finalités, catégories, destinataires, transferts, durées) | Partie I de ce dossier = base du registre ; à formaliser et tenir à jour | ⚠️ |
| Analyse d'impact (AIPD) | Code du numérique | 428 | Avant traitement à risque élevé | Messagerie à grande échelle / IA : AIPD recommandée dès le passage en production réelle | ⚠️ |
| Délégué à la protection des données (DPO) | Code du numérique | 430, 432 | Obligatoire si suivi régulier et systématique à grande échelle | Non désigné ; désignation recommandée (permet aussi une exemption de déclaration partielle — art. 408) | ⚠️ |

## 2. Information et consentement

| Obligation | Source | Article | Exigence | Mise en œuvre | Niveau |
|---|---|---|---|---|---|
| Politique de confidentialité publiée | Code du numérique | 415-418 | Information concise, claire, accessible, gratuite | Rédigée (Partie III) — **à publier** dans l'application + champs [À compléter] | ⚠️ |
| Information à la collecte | Code du numérique | 415 | Finalités, destinataires, durée, droits au moment de la collecte | Écran d'inscription à enrichir (lien politique + mentions minimales) | ⚠️ |
| Base légale par traitement | Code du numérique | 389 | Consentement / contrat / obligation légale / intérêts légitimes | Cartographié (Partie I §4) — à refléter dans les écrans (IA opt-in ✓ déjà le cas) | ✅ |
| Consentement pour fonctions IA | Code du numérique | 389, 415 | Consentement spécifique, information sur le transfert | Activation explicite par l'utilisateur ; information IA à ajouter dans l'interface | ⚠️ |
| Prospection commerciale | Code du numérique | 332, 400, 440 | Interdite sans régime adéquat ; opt-in | Non pratiquée | ✅ (et ℹ️) |
| Cookies / traceurs | Code du numérique (droit commun) ; régime dédié : à vérifier | 389, 415 | Information ; consentement pour les traceurs non nécessaires | Uniquement cookie de session nécessaire + localStorage préférences ; bannière non requise en l'état | ✅ (à revoir si ajout d'audience) |
| Mineurs | Code de l'enfant (2015) ; révision CEDEAO (à venir) | — | Protection des mineurs, consentement parental | Service non destiné aux mineurs ; clause 18+ prévue (Article 17) | ⚠️ (à publier) |

## 3. Droits des personnes

| Obligation | Source | Article | Exigence | Mise en œuvre | Niveau |
|---|---|---|---|---|---|
| Droit d'accès | Code du numérique | 437 | Communiquer les données sous 30 jours | Pas de procédure formalisée ; export possible via support | ⚠️ |
| Rectification / suppression | Code du numérique | 441 | Réponse sous 45 jours ; voie électronique acceptée | Auto-service (édition profil, contacts, réalisations) ; suppression de compte **à implémenter** | ❌ |
| Opposition / retrait de consentement | Code du numérique | 440, 389 | Faciliter l'opposition ; retrait aussi simple que le don | Contacts portfolio modifiables ; fonctions IA optionnelles | ⚠️ |
| Portabilité | Code du numérique | 438 | Format structuré lisible par machine | Non implémentée (export JSON possible à développer) | ❌ |
| Droit à l'oubli numérique | Code du numérique | 443 | Effacement des données publiées sur demande | Suppression de compte/contenus à implémenter + procédure | ❌ |
| Facilitation et gratuité | Code du numérique | 419-421 | Réponse ≤ 30 jours, gratuite | Procédure à documenter (Article 15 publié) | ⚠️ |

## 4. Sécurité et incidents

| Obligation | Source | Article | Exigence | Mise en œuvre | Niveau |
|---|---|---|---|---|---|
| Sécurité des traitements | Code du numérique | 426 | Mesures techniques et organisationnelles appropriées | TLS, contrôle d'accès par rôle, journal admin, validation des entrées, limite des médias, token interne | ✅ (base solide) |
| Chiffrement au repos | Code du numérique | 424, 426 | Adapté à la sensibilité | SQLite non chiffré — activer (SQLCipher / chiffrement disque hébergeur) | ⚠️ |
| Authentification robuste | Code du numérique | 424, 426 | Mesures proportionnées | OAuth Google/LinkedIn/Apple via NextAuth — aucun mot de passe stocké, sécurité de l'identité déléguée aux fournisseurs [MàJ 14/09/2026] | ✅ |
| Notification des violations | Code du numérique | 427 | Sans délai à l'APDP **et** aux personnes concernées | Procédure rédigée (Partie VI.5) ; à outiller (contacts, modèles) | ⚠️ |
| Confidentialité du personnel | Code du numérique | 425, 402 | Personnes sous autorité + obligations contractuelles | Clauses rédigées (Partie IV.B/C) — à faire signer | ⚠️ |
| Encadrement des sous-traitants | Code du numérique | 425-426 ; CEDEAO 2010 | Contrats de sous-traitance | Clauses rédigées (Partie IV.C, VI.3, VII.3) — à contractualiser avec hébergeur/Google | ⚠️ |
| Cryptologie (déclaration éventuelle) | Code du numérique ; décret du 02/07/2025 | — | Déclaration/autorisation des moyens et services de cryptologie selon leur nature | Usage TLS standard ; statut **à vérifier** auprès de l'ANSSI Bénin | ⚠️ |
| Sauvegardes et continuité | Code du numérique | 434 | Pérennité des données | Sauvegardes SQLite à formaliser (fréquence, chiffrement, test de restauration) | ⚠️ |
| Journalisation des accès admin | Code du numérique | 424, 426 | Traçabilité | Table AdminAction opérationnelle (médiation, modérations, statuts) | ✅ |

## 5. IA

| Obligation | Source | Article | Exigence | Mise en œuvre | Niveau |
|---|---|---|---|---|---|
| Encadrement du transfert IA | Code du numérique | 391, 407 | Autorisation APDP (transfert USA) | À inclure dans la demande d'autorisation globale | ❌ |
| Pas de décision automatisée excluant d'un droit | Code du numérique ; CEDEAO 2010 | 407 (7°) ; art. 35 | Interdiction sauf encadrement | IA = brouillons/suggestions uniquement, validation humaine systématique | ✅ |
| Non-utilisation pour entraînement | Conditions API Gemini | — | Compte payant (données non utilisées) | À activer avant production | ⚠️ |
| Information sur l'IA | Code du numérique | 415 | Informer des destinataires et transferts | Article 7 rédigé ; mention UI à ajouter | ⚠️ |
| Loi spécifique IA (Bénin/UEMOA/CEDEAO) | — | — | — | **N'existe pas à ce jour** ; révision CEDEAO 2026 (profilage) à suivre | ℹ️ |

## 6. Commerce électronique et paiements

| Obligation | Source | Article | Exigence | Mise en œuvre | Niveau |
|---|---|---|---|---|---|
| Obligations d'information e-commerce / consommation | Code du numérique Livre IV ; Code de la consommation (2023) | 332 et s. | Informations précontractuelles claires | CGU à rédiger (prix, offre, annulation, litiges) | ⚠️ |
| Paiements en ligne | Règlement UEMOA 15/2002 ; Instruction BCEAO 008-05-2015 | — | Intermédiation réservée aux établissements agréés | EmiID ne détient aucun fonds ; paiements via opérateurs Mobile Money agréés (MTN MoMo, Moov…) | ✅ (architecture conforme) |
| Données de paiement | BCEAO / établissements agréés | — | KYC et sécurité chez l'émetteur de monnaie électronique | Aucune donnée de carte/identifiant de paiement stockée par EmiID | ✅ |

## 7. Ce qui n'est pas applicable (aujourd'hui)

| Sujet | Motif | Niveau |
|---|---|---|
| RGPD | Pas d'établissement ni de ciblage dans l'UE (à re-vérifier si ouverture à la diaspora UE) | ℹ️ |
| Réglementation opérateur télécom (ARCEP) | EmiID n'est pas un opérateur de communications électroniques | ℹ️ |
| Agrément de paiement / établissement de monnaie électronique | Aucune détention de fonds ; intermédiation par opérateurs agréés | ℹ️ |
| Données biométriques / santé | Non collectées | ℹ️ |
| Géolocalisation | Non utilisée | ℹ️ |
| Infrastructure critique (ANSSI) | Plateforme non critique ; ANSSI reste l'interlocuteur cryptologie | ℹ️ |

## 8. Synthèse : 6 chantiers prioritaires

1. **Authentification réelle** (mots de passe hachés + reset) — bloque la production ; ❌ → ✅
2. **Déclaration APDP + demande d'autorisation de transfert** (hébergement + Gemini) ; ❌ → ✅
3. **Publication de la politique de confidentialité** (Partie III complétée) dans l'application ; ⚠️ → ✅
4. **Procédures de droits** (suppression de compte, export/portabilité, oubli numérique) ; ❌ → ✅
5. **Chiffrement au repos + sauvegardes chiffrées testées** ; ⚠️ → ✅
6. **Signature des contrats** (hébergeur, Google API payant, collaborateurs — Parties IV à VII). ⚠️ → ✅

---

*Suivant : PARTIE IX — Points à faire valider par un juriste.*
