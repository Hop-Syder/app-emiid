# Architecture Complète de l’Écosystème « Missions Courtes & Appels d’Offres » — EmiID

> Référence d'architecture produit et technique — Plateforme EmiID (Bénin / Afrique de l'Ouest)
> @author @hopsyder | Nexus Partners
> Date de publication : 15 septembre 2026

---

## 1. Vue d'Ensemble & Positionnement

Dans EmiID, le moteur **« Missions Courtes »** constitue le volet de sourcing actif : le client ne cherche pas simplement un profil dans l'annuaire, il publie un besoin concret, urgent et contextualisé pour obtenir des propositions qualifiées de professionnels vérifiés (coachs, artisans, freelances, consultants).

```
                       ÉCOSYSTÈME COMPLET DES MISSIONS EMIID
                       
   [ CLIENT / DONNEUR D'ORDRE ]                        [ PRESTATAIRE VÉRIFIÉ ]
                │                                                 │
   1. Expression du besoin                                        │
      (Dictée vocale ou texte)                                    │
                │                                                 │
                ▼                                                 │
   2. Cadrage IA (Gemini API)                                     │
      - Titre & Cahier des charges                                │
      - Budget estimé & Délai                                     │
                │                                                 │
                ▼                                                 │
   3. Publication & Alerte Locale                                 │
      (Cotonou, Calavi, etc.) ─────────────────────────────► Reçoit l'alerte
                │                                                 │
                │                                    4. Étude de l'opportunité
                │                                       (Consultation libre)
                │                                                 │
                │                                    5. Candidature (Pay-per-Lead)
                │                                       - Consomme 1 Crédit
                │                                       - Propose tarif & note
                │                                                 │
   6. Sélection & Démarre ◄───────────────────────────────────────┘
      (Rejet auto des autres)
                │
                ▼
   7. Exécution & Séquestre Mobile Money (Escrow optionnel 3-5%)
                │
                ▼
   8. Clôture de Mission
      ├─ Succès : Déblocage des fonds + Avis certifié + Score de réputation
      └─ Litige : Canal d'arbitrage (⚖️ Médiation EmiID) -> Sanctions / Strikes
```

---

## 2. Cycle de Vie d'une Mission (Machine à États)

| Statut | Déclencheur | Action système / Acteurs |
| :--- | :--- | :--- |
| `DRAFT` | L'utilisateur saisit ou dicte son besoin. | L'IA Gemini structure la demande (titre, livrables, budget, délai). |
| `PUBLISHED` | Le client valide la publication. | La mission est visible dans le flux et notifiée aux prestataires de la zone. |
| `APPLICATIONS_OPEN` | Période de réception des offres. | Les prestataires consomment **1 crédit** pour soumettre leur offre. |
| `ASSIGNED` | Le client sélectionne un candidat. | Verrouillage des candidatures. Rejet automatique des autres. Création du canal direct. |
| `IN_PROGRESS` | Début officiel des travaux. | Si option Escrow : consignation des fonds via Mobile Money (séquestre). |
| `COMPLETED` | Le client confirme le service fait. | Déblocage des fonds au prestataire. Attribution de la note et de l'avis vérifié. |
| `DISPUTED` | Signalement par l'une des parties. | Blocage des fonds. Alerte console admin. Entrée d'un médiateur dans le canal. |
| `CANCELLED` | Annulation avant sélection. | Remboursement des crédits consommés aux prestataires ayant postulé. |

---

## 3. Parcours Utilisateur Détaillé

### A. Donneur d'Ordre (Particulier, PME, ONG, Diaspora)
1. **Saisie guidée par IA (Assistance Gemini) :**
   - Expression naturelle par texte ou dictée vocale.
   - Structuration automatique : titre clair, livrables attendus, fourchette de budget locale (50 000 – 80 000 FCFA), délai et localisation (ex. Ganhi, Cotonou).
2. **Arbitrage du mode de règlement :**
   - **Séquestre Garanti (+3% à 5%) :** Fonds sécurisés par Mobile Money (MTN MoMo, Moov, Celtiis) jusqu'à confirmation du service fait.
   - **Paiement Direct :** Règlement direct de gré à gré (sans badge « Volume Garanti EmiID »).
3. **Sélection du prestataire :**
   - Consultation des profils vérifiés (Niveaux 1 à 5), badges de réputation, avis certifiés.
   - Validation en un clic avec notification instantanée.

### B. Prestataire (Coach, Artisan, Freelance, Consultant)
1. **Consultation & Filtrage gratuit :**
   - Accès libre au flux des opportunités filtré par spécialité et localité.
2. **Candidature Pay-per-Lead :**
   - Consommation de **1 crédit** par proposition commerciale.
   - Protection anti-spam garantissant le sérieux et l'engagement des candidatures.
3. **Exécution & Traçabilité :**
   - Échanges journalisés (messages texte, photos d'avancement, vocal).
   - Clôture avec validation d'avis réel et incrémentation de la réputation.

---

## 4. Modèle Économique Spécifique

```
                                  FLUX MONÉTAIRE
                                  
     Prestataire ────────(Achat Pack 5 ou 15 crédits)────────► [ Revenu EmiID immédiat ]
                                                                       ▲
     Client B2B / ONG ───(Forfait Sourcing Express 15 000 F)───────────┤
                                                                       │
     Client Sécurisé ────(Frais de Séquestre 3% à 5%)──────────────────┘
```

1. **Monétisation à la candidature (Pay-per-Lead) :**
   - **Pack 5 crédits :** 2 000 FCFA (400 FCFA par mission postulée).
   - **Pack 15 crédits :** 5 000 FCFA (333 FCFA par mission postulée).
   - Revenu immédiat pour EmiID dès la mise en relation, résistant au contournement hors plateforme.
2. **Garantie de Séquestre (3% à 5%) :**
   - Protection des fonds pour les donneurs d'ordre exigeants et la diaspora.
3. **Sourcing Express B2B (15 000 FCFA) :**
   - Prise en charge clé en main pour entreprises, ONG et collectivités territoriales sous 24h.

---

## 5. Sécurisation, Litiges & Règle des « Deux Manquements »

- **Canal de Médiation officiel (`⚖️ Médiation EmiID`) :**
  - Insertion directe d'un médiateur admin dans le canal en cas de réclamation.
  - Analyse des preuves (audios, photos d'avancement, livrables).
- **Règle des Deux Manquements :**
  - **1er manquement documenté :** 1er avertissement (`strikesCount = 1`), rétrogradation temporaire de visibilité et suspension du badge Vérifié.
  - **2e manquement documenté :** Radiation définitive (`strikesCount = 2`), remboursement des fonds séquestrés au client, et notification formelle au parrain avec dégradation de son score de confiance.

---

## 6. Alignement Territorial & DSI Awards 2026

- **Catégorie 5 (ESN et innovation numérique pour les communes et collectivités)** & **Catégorie 8 (Territoires connectés)**.
- **Circuit court économique :** Les flux monétaires irriguent directement les professionnels locaux dans les communes (Cotonou, Abomey-Calavi, Porto-Novo, etc.).
- **Inclusion financière :** Historique vérifiable d'activité servant d'antécédent de solvabilité auprès des institutions bancaires et de micro-finance.
