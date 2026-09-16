# PARTIE VII — Clauses relatives à l'intelligence artificielle

> Le projet utilise deux fonctions d'IA : **rédaction assistée de mission** et **interprétation de la recherche vocale**, via l'API Gemini de Google.
> Cadre juridique applicable : il n'existe **aucune loi spécifique à l'IA au Bénin ni dans l'UEMOA à ce jour** ; les traitements IA restent soumis au droit commun — Livre V du Code du numérique (consentement, information, sécurité, transferts hors Bénin, art. 407 7° pour les traitements automatisés excluant une personne d'un droit/prestation), acte CEDEAO A/SA.1/01/10 art. 35 (décisions automatisées) et, à venir, révision CEDEAO de 2026 (profilage soumis à autorisation). Le cadre IA est un **point de vigilance à suivre** (Partie IX).

---

## VII.1 — Clause IA dans la politique de confidentialité

*(Déjà intégrée à l'Article 7 de la Partie III — rappel des engagements clés à maintenir :)*

1. Les fonctions IA sont **optionnelles** et activées par l'utilisateur ; tout le reste du service fonctionne sans elles.
2. Seul le **contenu strictement nécessaire** (texte de mission / transcription de recherche) est transmis ; aucune donnée d'identification (nom, e-mail, téléphone) n'y est ajoutée.
3. **Pas de décisions automatisées** affectant les utilisateurs : l'IA ne produit qu'un **brouillon** ou des **suggestions de filtres**, toujours validés par l'utilisateur avant effet.
4. Transparence sur le fournisseur (Google — API Gemini) et sur la conservation des données selon le niveau du compte API (gratuit : données susceptibles d'être utilisées pour l'amélioration des produits Google, avec relecture humaine possible ; payant : non).
5. Transferts hors Bénin encadrés (Articles 7 et 11 de la politique ; art. 391 et 407 du Code du numérique).

## VII.2 — Clause IA — Utilisateur (CGU)

**Article X — Fonctions d'intelligence artificielle**

1. **Fonctions optionnelles.** La plateforme propose des fonctions assistées par IA : rédaction d'un brouillon de mission à partir du texte que vous saisissez ou dictez, et interprétation de votre recherche vocale. Ces fonctions ne sont actives que sur votre action.
2. **Transmission de données.** L'activation de ces fonctions entraîne l'envoi du contenu concerné (texte de mission ou transcription vocale) à un prestataire d'IA (Google — API Gemini), qui peut être situé hors du Bénin. Aucune donnée d'identification de votre compte n'y est jointe.
3. **Supervision humaine.** Les contenus générés par l'IA sont des **propositions** : vous les vérifiez, les modifiez et les confirmez. Aucun contenu n'est publié et aucune décision (publication de mission, filtrage) n'intervient sans votre validation.
4. **Limites de l'IA.** Les contenus générés peuvent être inexacts ou incomplets. EmiID ne garantit pas leur exactitude et vous invite à les vérifier avant toute publication.
5. **Interdiction d'abus.** Vous ne devez pas utiliser les fonctions IA pour générer des contenus illicites, trompeurs, diffamatoires, discriminatoires ou portant atteinte aux droits de tiers.
6. **Retrait du consentement.** Vous pouvez cesser d'utiliser ces fonctions à tout moment ; cela n'affecte pas le reste du service.

## VII.3 — Clause IA — Prestataire / Sous-traitant IA (à intégrer dans les conditions du fournisseur ou à opposer par choix de configuration)

**Article X — Traitement par des modèles d'intelligence artificielle**

1. **Finalité limitée.** Le Prestataire IA traite les contenus transmis **exclusivement** pour fournir le résultat demandé (génération du brouillon, extraction des filtres). Il s'interdit toute finalité autonome : prospection, constitution de profils, vente de données.
2. **Entraînement des modèles.** Il est convenu que les contenus transmis par EmiID **ne sont pas utilisés pour entraîner ou améliorer des modèles**. En conséquence, EmiID configure son accès au niveau **payant** de l'API Gemini (pour lequel Google ne les utilise pas), et joint à la signature les conditions applicables ; tout changement de traitement est notifié **30 jours** avant, avec possibilité de résilier. *(Si un niveau gratuit devait être utilisé à titre temporaire en démonstration : interdire la transmission de données personnelles réelles ; données de démonstration fictives uniquement.)*
3. **Prompts et confidentialité.** Les requêtes (prompts) et réponses sont confidentielles ; le Prestataire ne les révèle pas à des tiers, sous réserve de relectures humaines expressément prévues par ses conditions — auquel cas les relecteurs sont soumis à la confidentialité et les contenus sont purgés selon le délai contractuel annoncé.
4. **Conservation.** Le Prestataire conserve les contenus au maximum [30 jours / selon les conditions en vigueur] à des fins d'abus et de monitoring, puis les supprime. EmiID n'archive pas les échanges avec le modèle au-delà du nécessaire technique.
5. **Sous-traitants IA.** Le Prestataire peut recourir à des sous-traitants techniques pour l'exploitation des modèles, soumis aux obligations équivalentes ; la liste est communiquée sur demande.
6. **Sécurité.** Chiffrement en transit et au repos, contrôle d'accès, journalisation, conformité aux articles 424 et 426 du Code du numérique.
7. **Erreurs et supervision humaine.** Le Prestataire reconnaît que les modèles peuvent produire des résultats inexacts (« hallucinations »). EmiID garantit la **supervision humaine** de tout résultat avant effet pour l'utilisateur ; aucun résultat IA ne produit seul d'effet juridique à l'égard d'une personne.
8. **Décisions automatisées.** Les fonctions IA d'EmiID ne prennent **aucune décision automatisée** produisant des effets juridiques à l'égard d'une personne (art. 407 7° du Code du numérique ; art. 35 de l'acte CEDEAO A/SA.1/01/10). Si le projet introduisait un tel usage (ex. scoring de vérification automatisé), une analyse de conformité préalable (autorisation APDP le cas échéant) serait requise.
9. **Incidents** : notification à EmiID sous **48 heures** pour tout incident affectant les contenus transmis (fuite, exposition, accès non autorisé).
10. **Fin de contrat** : suppression de tous les contenus, avec attestation.

## VII.4 — Clause IA — Développeur / Agence technique

**Article X — Développement autour de fonctions IA**

1. Le Développeur implémente les appels aux modèles IA conformément aux spécifications d'EmiID : **transmission minimale** (texte de mission / transcription uniquement), **aucune donnée d'identification** ajoutée aux requêtes, **aucun logging des prompts** contenant des données personnelles vers des systèmes non approuvés.
2. Les **clés d'API IA** sont des secrets : stockage dans le gestionnaire de secrets désigné, interdiction de les committer, de les partager ou de les utiliser pour un autre projet (cf. clause développeur — Partie IV.D).
3. **Aucune donnée de production réelle** ne doit transiter par des comptes de développement : les environnements de test utilisent des données fictives et des comptes API dédiés.
4. Le Développeur n'entraîne aucun modèle sur les données du projet et n'ajoute aucune dépendance IA tierce sans validation écrite d'EmiID (évaluation confidentialité + transferts).
5. Toute modification du flux IA (nouveau fournisseur, nouveaux champs transmis) fait l'objet d'une **demande de validation préalable**, car elle peut déclencher des formalités APDP (transfert hors Bénin) et une mise à jour de la politique de confidentialité.
6. Sur demande, le Développeur documente les flux IA (schéma, champs transmis, durées de rétention) pour le registre des traitements et l'analyse d'impact.

## VII.5 — Encadrement interne des fonctions IA (document opérationnel)

1. **Registre** : les deux fonctions IA figurent au registre des activités de traitement (finalité : assistance à la rédaction / recherche ; données : texte de mission, transcription ; destinataire : Google API Gemini ; transfert : hors Bénin — formalités art. 391/407).
2. **Configuration** : compte API **payant** avant production (données non utilisées pour l'entraînement) ; quotas et supervision des coûts ; journalisation technique locale du succès/échec **sans conservation du contenu** au-delà de la fonction.
3. **Minimisation** : la requête système n'inclut jamais de données personnelles ; le texte utilisateur est transmis tel quel (responsabilité de l'utilisateur de ne pas y inclure de données sensibles — rappel dans l'interface).
4. **Révision périodique** : revue semestrielle des conditions du fournisseur IA (changements de conservation/entraînement) et de l'évolution du cadre réglementaire (révision CEDEAO 2026, initiatives UA/AU sur l'IA).
5. **Documentation utilisateur** : chaque fonction IA est expliquée dans l'interface au moment de son utilisation (ce qui est envoyé, à qui, pourquoi).

---

*Suivant : PARTIE VIII — Tableau de conformité.*
