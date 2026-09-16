# PARTIE VI — Clauses de cybersécurité

> Clauses à intégrer selon le destinataire : CGU (utilisateur), contrats de travail (collaborateur), contrats de prestation (hébergeur, développeur), NDA (partenaire). Références : articles 424, 426 et 427 du Code du numérique béninois ; Livre VI (cybercriminalité et cybersécurité) ; décrets d'application du 2 juillet 2025 (cryptologie, interception et accès aux données).

---

## VI.1 — Clause utilisateur (CGU) : sécurité du compte

**Article X — Sécurité de votre compte**

1. Vous êtes responsable de la sécurité de votre accès : confidentialité de vos identifiants et de l'appareil utilisé, déconnexion après usage sur un appareil partagé.
2. Toute activité réalisée via votre session est réputée effectuée par vous, sauf notification rapide de votre part.
3. En cas de **compromission suspectée de votre compte** (connexion inhabituelle, message envoyé sans vous, changement de contacts non sollicité), vous devez nous en informer immédiatement à [À compléter] ; nous suspendrons l'accès et procéderons à la réinitialisation.
4. Vous ne devez pas : tenter d'accéder aux comptes d'autres utilisateurs, exploiter des vulnérabilités, contourner les mesures techniques, envoyer des contenus malveillants (virus, injections), ni automatiser des accès sans autorisation (scraping, robots). Ces comportements sont notamment réprimés par le Livre VI du Code du numérique.
5. Nous nous réservons le droit de suspendre un compte en cas de risque de sécurité pour la plateforme ou ses utilisateurs, en vous informant dans la mesure du possible.

## VI.2 — Clause collaborateur : sécurité des systèmes et des accès

**Article X — Sécurité des systèmes d'information**

1. Le Collaborateur applique les règles internes de sécurité : gestion des mots de passe (robustesse, unicité, gestionnaire de mots de passe), authentification à deux facteurs lorsqu'elle est proposée, verrouillage de session, mises à jour de sécurité des postes et appareils.
2. **Accès nominatif et moindre privilège** : le Collaborateur n'utilise que les accès attribués à son nom, pour les seuls besoins de sa fonction. Il ne partage jamais ses identifiants et ne les transmet que par l'outil de gestion des secrets désigné.
3. **Appareils** : tout appareil utilisé pour accéder aux systèmes doit être à jour, protégé par un code d'accès et, si exigé, chiffré. L'usage d'appareils personnels est soumis à validation (BYOD) : [À compléter : politique].
4. **Données** : aucune copie de données de production hors des environnements autorisés ; toute copie autorisée est chiffrée et détruite après usage, avec confirmation écrite.
5. **Incidents** : le Collaborateur signale **immédiatement** (objectif : sous 1 heure, au plus tard 24 heures) tout incident ou anomalie suspecte — accès non autorisé, fuite, perte/vol d'appareil, comportement anormal d'un système, courriel de phishing — à [À compléter : canal de signalement], et coopère à l'analyse.
6. **Interdictions** : introduction de logiciels non autorisés, ingénierie sociale, tests d'intrusion non mandatés, contournement des contrôles de sécurité, divulgation d'informations sur l'infrastructure à des tiers.
7. **Cryptologie** : l'usage de moyens de cryptologie pour les besoins du service respecte la réglementation applicable (Code du numérique ; décret du 2 juillet 2025 sur la déclaration/autorisation des moyens et services de cryptologie) ; le Collaborateur n'installe aucun moyen de cryptologie non approuvé.
8. **Fin du contrat** : restitution de l'ensemble des accès et supports ; révocation immédiate des accès par l'Entreprise.
9. **Responsabilité** : toute violation peut donner lieu à sanctions disciplinaires et légales (Livre VI du Code du numérique), sans préjudice de dommages-intérêts.

## VI.3 — Clause prestataire / hébergeur : obligations de sécurité renforcées

**Article X — Sécurité et gestion des incidents**

1. **Norme de référence.** Le Prestataire garantit un niveau de sécurité conforme aux articles 424 et 426 du Code du numérique et, à défaut de standard spécifique imposé par le Client, aligné sur [ISO/IEC 27001 ou SOC 2 — à sélectionner] pour les services fournis. Une attestation ou un résumé de conformité est fourni à la signature et renouvelé **annuellement**.
2. **Mesures minimales** : chiffrement TLS en transit et chiffrement au repos des supports hébergeant la base de données ; cloisonnement réseau ; protection contre les intrusions ; journalisation centralisée des accès administratifs (conservée [12] mois) ; gestion des vulnérabilités (correctifs de sécurité critiques appliqués sous [72 heures]) ; gestion des accès (moindre privilège, double contrôle des accès de production, révocation sous [24 heures] après départ d'un intervenant).
3. **Sauvegardes** : [fréquence à compléter], chiffrées, testées au moins [semestriellement], conservées hors du même environnement que la production.
4. **Secrets** : stockage des clés et secrets dans un coffre (secret manager) ; rotation au moins [annuelle] et en cas d'incident ou de départ d'un intervenant.
5. **Incident** : notification au Client **sans délai et au plus tard 24 heures** après constatation, avec : nature et chronologie, données et personnes concernées (approximation), mesures d'endiguement et de remédiation, plan de communication. Le Prestataire coopère à toute investigation et préserve les preuves (journaux, images système). Le Client demeure responsable de la notification à l'APDP et aux personnes concernées (art. 427) ; le Prestataire lui fournit toute l'assistance nécessaire, y compris pour la notification **sous 72 heures** visée par l'acte CEDEAO révisé à venir.
6. **Enquête et coopération** : le Prestataire facilite l'analyse post-incident (rétrospective technique sous [15 jours]) et la mise en œuvre des mesures correctrices.
7. **Pénalités (facultatif)** : manquement aux obligations d'incident : [montant] par jour de retard de notification — *à négocier.*
8. **Audit** : droit d'audit annuel du Client ou de son mandataire (préavis 15 jours), ou acceptation d'un rapport d'audit indépendant de l'année en cours.
9. **Sous-traitance** : tout intervenant du Prestataire est soumis aux obligations équivalentes ; liste tenue à jour sur demande.
10. **Responsabilité** : le Prestataire répond des conséquences directes d'un manquement aux présentes obligations de sécurité.

## VI.4 — Clause partenaire (NDA) : sécurité de l'échange

**Sécurité des échanges.** Les informations confidentielles sont transmises par des canaux sécurisés (lien chiffré, espace documentaire à accès contrôlé). La Partie Réceptrice applique aux Informations Confidentielles des mesures techniques et organisationnelles au moins équivalentes à celles prévues par les articles 424 et 426 du Code du numérique. Toute fuite, perte ou accès non autorisé est notifié à la Partie Divulguante sous **48 heures**. Les données personnelles éventuellement échangées sont supprimées ou restituées à la fin des discussions, avec attestation.

## VI.5 — Procédure interne de gestion des incidents (document opérationnel — à conserver en interne)

> Document de référence pour appliquer l'art. 427 du Code du numérique. À adapter et à joindre au dossier de conformité.

1. **Détection** : surveillance des journaux serveur ; signalement utilisateur (canal dédié) ; alertes de l'hébergeur.
2. **Qualification** (sous 2 h) : gravité (S1 : fuite de données personnelles / indisponibilité totale ; S2 : compromission partielle ; S3 : anomalie sans impact données) ; décider de l'activation de la cellule de crise.
3. **Endiguement** (S1 : sous 4 h) : suspension des accès concernés, rotation des secrets, blocage IP, mode dégradé, sauvegarde préservée.
4. **Analyse** : périmètre exact des données (quelles tables, quels utilisateurs), durée d'exposition, cause racine.
5. **Notification** (art. 427) : en cas de rupture de sécurité affectant des données personnelles :
   - **sans délai à l'APDP** : nature de la rupture, catégories et nombre approximatif de personnes concernées, catégories et nombre approximatif d'enregistrements, nom et coordonnées du point de contact, conséquences probables, mesures prises ;
   - **sans délai aux personnes concernées** : message clair (ce qui s'est passé, données concernées, risques, mesures, recommandations : changement de mot de passe, vigilance phishing, contacts) ;
   - journalisation de la notification (date, contenu, canal).
6. **Remédiation** : correctifs, renforcement, tests post-incident ; rétrospective écrite sous 15 jours (chronologie, causes, plan d'action daté).
7. **Registre des incidents** : tout incident (même sans notification) consigné : date, nature, impact, mesures, clôture.

---

*Suivant : PARTIE VII — Clauses IA.*
