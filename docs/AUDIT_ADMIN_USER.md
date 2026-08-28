# Audit — communication admin ↔ application

> État au 2026-08-26. Objectif : vérifier que les actions du back-office
> produisent un effet réel côté utilisateur, et éliminer ce qui est inactif.

## Comment les deux applications communiquent

Il n'y a **pas d'API entre elles**. `frontend-admin` et `frontend-user` écrivent
et lisent la **même base Supabase** (~90 accès directs chacune) ; le backend
Express ne sert qu'à l'application utilisateur (24 appels, contre 2 côté admin).

**La base est donc le contrat.** Toute action admin n'a d'effet que si un champ
partagé est effectivement relu ailleurs — d'où cet audit.

## Correspondance des champs

| Champ écrit par l'admin | Lu côté app | Effet |
|---|---|---|
| `is_verified` | ✅ (19 fichiers) | badge, classement |
| `is_premium` | ✅ (17) | badge, priorité recherche |
| `is_published` | ✅ (15) | visibilité annuaire |
| `is_locked` / `pin_attempts` | ✅ | déverrouillage PIN |
| `is_suspended` / `suspended_until` | ⚠️ partiel → **corrigé** | voir ci-dessous |

## Problèmes trouvés et traités

### 1. 🔴 Suspension non appliquée à l'API (faille)
`suspendUser` écrit `user_profiles.is_suspended`. Le middleware Next bloquait
bien la navigation, mais le **backend Express** ne contrôlait que
`user_metadata.account_disabled` — un compte suspendu conservait donc l'accès
complet à l'API (messagerie, paiements, édition de profil).

**Corrigé** : `requireAuth` vérifie désormais `is_suspended`, en évaluant
`suspended_until` pour qu'une suspension temporaire expire d'elle-même.

### 2. 🔴 Données fictives permanentes dans l'annuaire
`/api/annuaire/stats-countries` et `/api/annuaire/tags` appelaient
`get_top_countries()` et `get_popular_tags()` — **absentes de toute migration**.
L'appel échouait systématiquement et les routes servaient un jeu **inventé**
(« Sénégal 45, Côte d'Ivoire 38 », tags « fintech », « agro »…), affiché en
permanence dans les filtres, la liste des pays et les tags.

**Corrigé** : les deux fonctions sont créées (`20260826_directory_stats_rpc.sql`)
et les fallbacks fictifs supprimés — en cas d'erreur, la liste est **vide**.
Un annuaire qui invente ses chiffres perd sa raison d'être.

### 3. 🟠 Fonctionnalités annoncées « bientôt » alors qu'elles sont livrées
| Élément | Contradiction | Traitement |
|---|---|---|
| CTA « Passer Premium » du hub | affichait « Premium arrive bientôt » alors que l'abonnement et le paiement sont livrés | mène à **Paramètres → Abonnement** |
| Entrée « KYC — bientôt » (onglet Profil) | l'onglet **Vérification** gère déjà CNI / CIP / passeport / IFU | mène à **Paramètres → Vérification** |
| Carte « Assistant de recherche » | annonçait « bientôt » alors que l'assistant Groq répond déjà sur 0 résultat | texte aligné sur le comportement réel |

### 4. Défaut découvert en corrigeant
`?tab=` n'était **pas lu** par la page Paramètres : les liens ci-dessus — et le
`callbackUrl` de retour de paiement d'un boost — seraient retombés sur l'onglet
par défaut. `use-settings` honore désormais ce paramètre, en le validant contre
la liste des onglets connus.

## Conservé volontairement
- Badge « Bientôt » des providers OAuth (page de connexion) : honnête, les
  boutons sont réellement `disabled`.
- Données d'illustration du hub public (ticker, radar) : assumées comme
  décoratives, hors périmètre MVP.
