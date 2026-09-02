# Recherche annuaire — architecture IA (gratuite, dégradation propre)

La recherche de profils EmiID est construite en **couches empilées**. Chaque
couche améliore la pertinence, mais **aucune n'est indispensable** : si une clé
API manque ou qu'un service est indisponible, la recherche retombe
automatiquement sur la couche inférieure. **Elle fonctionne toujours.**

| Couche | Rôle | Techno | Coût | Clé requise |
|--------|------|--------|------|-------------|
| ① Lexicale | multi-mots, radicalisation FR, fautes de frappe | Postgres FTS `french` + `pg_trgm` | gratuit | — |
| ② Sémantique | comprendre le *sens* (« refaire mon élec » → électricien) | pgvector + embeddings Gemini | gratuit | `GEMINI_API_KEY` |
| ③ Intention / reco | reformuler & recommander quand 0 résultat | Gemini Flash-Lite | gratuit | `GEMINI_API_KEY` |

```
requête ──► ① FTS (toujours) ─┐
        └─► ② sémantique (si clé) ─┤──► fusion RRF ──► profils classés
                                    └─(0 résultat)──► ③ assistant/reco (Gemini)
```

---

## Couche ① — FTS français + trigram  *(actif)*

- **Migration :** `sql/migrations/20260820_fts_search.sql`
- Colonne générée `search_vector tsvector` + index GIN ; index trigram sur
  `role`, `specialty`, `city`, nom complet.
- **RPC :** `search_profile_ids(q text, max_results int) → (profile_id, rank)`.
- Consommée par `frontend-user/app/api/annuaire/route.ts`.

Rien à configurer. Gère « couturier à Akpakpa », « électricien Cotonou »,
et tolère les fautes (« couturié »).

---

## Couche ② — Recherche sémantique  *(actif si `GEMINI_API_KEY`)*

- **Migration :** `sql/migrations/20260902_enable_semantic_search.sql`
  (extension `vector`, colonne `embedding vector(768)`, `embedding_stale`,
  trigger de péremption, index HNSW cosinus, RPC `match_profiles_semantic`).

  > ⚠️ Elle **remplace** `20260821_semantic_search.sql`, qui ne pouvait pas
  > s'appliquer sur ce projet Supabase (`42704: type vector does not exist`).
  > Trois écarts corrigés : l'extension est installée dans le schéma
  > `extensions` (convention Supabase), `match_profiles_semantic` est
  > **SECURITY DEFINER** dès sa création — sans quoi elle lèverait `42501` sur
  > la colonne `embedding`, rejouant la panne « zéro profil » du 01/09 — et le
  > trigger a un `search_path` figé. Ne pas jouer l'ancienne migration.
- **Embedding requête :** `frontend-user/lib/embeddings.ts`
  (`gemini-embedding-001`, tronqué à 768 dims, `taskType=RETRIEVAL_QUERY`,
  timeout 3,5 s, renvoie `null` si indispo).

  > ⚠️ **`text-embedding-004` a été arrêté par Google le 14/01/2026** — tout
  > appel renvoie 404. Le modèle de remplacement est `gemini-embedding-001`,
  > sur le même endpoint `embedContent`, avec deux contraintes :
  > il renvoie **3072 dimensions par défaut** (d'où `outputDimensionality: 768`,
  > sinon la base rejette le vecteur), et Google **exige la normalisation L2**
  > pour toute dimension autre que 3072 — appliquée des deux côtés, requête et
  > document, faute de quoi les vecteurs ne vivent pas dans le même espace.
  > Les trois valeurs — colonne `vector(768)`, index HNSW, `EMBED_DIM` des deux
  > scripts — doivent rester alignées.
- **Backfill profils :** `backend/scripts/embed-profiles.js`
  (`taskType=RETRIEVAL_DOCUMENT`).
- **Fusion :** dans la route annuaire, les classements ① et ② sont combinés par
  **Reciprocal Rank Fusion** (RRF, `K=60`, poids FTS 1,0 / sémantique 0,9) —
  robuste aux échelles de score différentes.

### Mise en service (3 étapes)

1. **Jouer la migration** dans le SQL Editor Supabase :
   `sql/migrations/20260902_enable_semantic_search.sql`
   (après `20260901_fix_search_rpc_privileges.sql`, qui répare la couche ①).

   Contrôle attendu — les deux RPC doivent être en `SECURITY DEFINER` :

   ```sql
   select proname, prosecdef, proconfig
   from pg_proc
   where proname in ('search_profile_ids', 'match_profiles_semantic');
   ```

2. **Variables d'environnement :**

   | Où | Variable | Valeur |
   |----|----------|--------|
   | Vercel `frontend-user` | `GEMINI_API_KEY` | clé Google AI Studio (`AQ.…` ou `AIza…`) |
   | Backend `.env` (Render/local) | `SUPABASE_URL` | URL du projet |
   | Backend `.env` | `SUPABASE_SERVICE_ROLE_KEY` | clé *service role* |
   | Backend `.env` | `GEMINI_API_KEY` | même clé Gemini |

   > La clé Gemini se crée sur https://aistudio.google.com/apikey (bouton
   > **Create API key**). Google délivre désormais des clés « auth » préfixées
   > `AQ.` (liées à un compte de service) à la place des anciennes `AIza…` ;
   > les deux formats fonctionnent sur `generativelanguage.googleapis.com`.
   >
   > La clé est transmise via l'en-tête **`x-goog-api-key`**, jamais en
   > paramètre d'URL : c'est la forme documentée par Google, la seule acceptée
   > par toutes les routes avec les clés `AQ.`, et elle évite d'inscrire le
   > secret dans les journaux de proxy. Vérification rapide d'une clé :
   >
   > ```bash
   > curl -s -o /dev/null -w '%{http_code}\n' \
   >   -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent' \
   >   -H 'Content-Type: application/json' \
   >   -H "x-goog-api-key: $GEMINI_API_KEY" \
   >   -d '{"content":{"parts":[{"text":"test"}]},"outputDimensionality":768}'
   > # 200 = clé valide · 400 = clé invalide · 404 = modèle inexistant
   > ```

3. **Générer les vecteurs** (une fois, puis périodiquement) :

   ```bash
   cd backend
   node scripts/embed-profiles.js         # n'embarque que les profils périmés
   node scripts/embed-profiles.js --all   # tout re-embarquer (changement de modèle)
   ```

   **Où l'exécuter ?** Le script parle à Supabase et à Gemini par le réseau : il
   n'a besoin d'aucune infrastructure particulière, seulement des trois
   variables ci-dessus dans `backend/.env`.

   - **Premier remplissage : en local**, c'est le plus simple et l'on voit
     défiler les erreurs éventuelles.
   - **Ensuite : sur le backend** (Render), en tâche planifiée quotidienne. Le
     trigger `trg_mark_embedding_stale` ne laisse traiter que les profils
     modifiés, donc l'exécution est courte et le quota gratuit suffit.

   > La `SUPABASE_SERVICE_ROLE_KEY` contourne la RLS : elle ne doit jamais
   > quitter `backend/.env` ni les variables d'environnement du serveur.
   > Ne jamais la placer dans le frontend ni la commiter.

   Le trigger `trg_mark_embedding_stale` repositionne `embedding_stale=true`
   dès qu'un champ texte d'un profil change → relancer le script (cron
   quotidien recommandé) ré-embarque uniquement le nécessaire.

### Dégradation

- Pas de `GEMINI_API_KEY` → `embedQuery()` renvoie `null` → **couche ① seule**.
- Aucun profil encore embarqué → `match_profiles_semantic` renvoie 0 →
  **couche ① seule**.
- Gemini en timeout/quota → `null` → **couche ① seule**.

Aucun de ces cas ne casse la recherche.

---

## Langage parlé — correctif (migration `20260828`)

« je recherche un artisan » ne renvoyait **aucun** résultat, alors que des
artisans existent.

**Cause :** `websearch_to_tsquery` applique un **ET implicite**. Le dictionnaire
français écarte « je » et « un » (mots vides) mais **pas « recherche »** : la
requête devenait `recherch & artisan`, et aucun profil ne contient ce mot. La
dictée vocale produisant systématiquement ce type de phrase, le problème était
structurel, pas marginal.

**Réponse en deux temps :**
1. les **formulations de requête** sont retirées avant analyse (« je cherche »,
   « il me faut », « svp »…) ; si le nettoyage vide la saisie, on repart de
   l'originale ;
2. si le ET ne donne rien, on retombe sur un **OU** entre les termes restants —
   une correspondance partielle vaut mieux qu'une page vide.

Le classement distingue les deux cas : correspondance complète d'abord
(socle 0,60), partielle ensuite (socle 0,25). Les **catégories** restent
couvertes par le poids A du `search_vector` : « artisan » atteint donc
`category = 'Artisan'` sans qu'aucun filtre ne soit posé.

**Dictée vocale :** la fin de la dictée vaut validation — la recherche part
automatiquement (`VOICE_SUBMIT_DELAY_MS`, page `/recherche`).

## Classement des résultats — hiérarchisation  *(actif)*

Décision : **pertinence d'abord + bonus statut**, avec **cascade pondérée** des
champs.

- **Migration :** `sql/migrations/20260822_search_ranking.sql`.
- **Priorité des champs** (encodée dans l'index via `setweight`) :
  `métier/catégorie (A)` > `ville (B)` > `secteur (C)` > `contexte (D : nom,
  slogan, bio)`. Coefficients `ts_rank` natifs `{A=1.0, B=0.4, C=0.2, D=0.1}`.
- **`search_profile_ids`** réécrite : les correspondances réelles (FTS pondéré
  et/ou tag) reçoivent un socle `1.0 + rangs` et passent **toujours** devant les
  rattrapages « faute de frappe » (trigram, `< 1.0`) → hiérarchie préservée.
- **Bonus statut** (côté route `app/api/annuaire/route.ts`, multiplicatif) :
  `score_final = pertinence × (1 + 0,30·premium + 0,15·vérifié)`. Un premium
  hors-sujet reste en bas. Départages : premium → vérifié → abonnés → récence.
- **Navigation sans recherche :** premium → vérifié → plus récents.

Curseurs ajustables : bonus premium `0,30` et vérifié `0,15` (route) ; poids des
champs A/B/C/D (migration).

---

## Couche ③ — Intention & recommandations  *(actif si `GEMINI_API_KEY`)*

Se déclenche sur le cas **0 résultat** dans l'annuaire : Gemini Flash-Lite génère
un message empathique + 3 à 5 **suggestions de recherche cliquables** (métier +
ville réalistes au Bénin), qui relancent la recherche.

- **Helper :** `frontend-user/lib/search-assistant.ts` (`searchAssistant()`,
  modèle `gemini-3.5-flash-lite`, sortie JSON contrainte par `responseSchema`,
  timeout 6 s, renvoie `null` si indispo).
- **Endpoint :** `frontend-user/app/api/search-assistant/route.ts` (`GET ?q=`).
- **UI :** `frontend-user/components/annuaire-public-content/search-assistant.tsx`,
  affiché sous l'état vide de `annuaire-grid.tsx` quand une recherche est active.

> **Bascule Groq → Gemini (02/09/2026).** Cette couche tournait sur Groq/Llama et
> exigeait une seconde clé. Les couches ② et ③ partagent désormais
> `GEMINI_API_KEY` : une seule clé à provisionner, à surveiller et à renouveler.
> `lib/groq.ts` et la variable `GROQ_API_KEY` ne sont plus utilisés — la variable
> peut être retirée de Vercel.
>
> Gain au passage : la sortie JSON n'est plus seulement *demandée* dans le prompt,
> elle est **contrainte par un `responseSchema`** côté Gemini. Le modèle ne peut
> structurellement pas répondre hors format.

### Mise en service

| Où | Variable | Valeur |
|----|----------|--------|
| Vercel `frontend-user` | `GEMINI_API_KEY` | même clé que la couche ② |
| Vercel `frontend-user` | `GEMINI_ASSISTANT_MODEL` *(optionnel)* | défaut `gemini-3.5-flash-lite` |

Le modèle est surchargeable par variable d'environnement : le catalogue Google
évolue vite, et en changer ne doit pas demander un redéploiement de code. Pour
connaître les modèles réellement ouverts à votre clé :

```bash
curl -s 'https://generativelanguage.googleapis.com/v1beta/models' \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  | jq -r '.models[] | "\(.name)  →  \(.supportedGenerationMethods | join(", "))"'
```

### Coût et quotas

Tout reste sur le **palier gratuit** de l'API Gemini, qui ne bascule jamais en
facturé sans activation explicite de la facturation. Les quotas gratuits sont
toutefois resserrés et varient selon le compte : les limites en vigueur se
consultent dans Google AI Studio. L'assistant n'étant appelé **que** sur une
recherche à 0 résultat, le volume reste marginal.

### Dégradation

Sans `GEMINI_API_KEY`, en cas de quota atteint (429) ou d'erreur/timeout,
l'endpoint renvoie une charge vide et **aucun bloc assistant ne s'affiche** —
l'état vide standard (« Aucun résultat trouvé » + réinitialiser les filtres)
reste inchangé. Un dépassement de quota gratuit n'a donc aucun effet visible
autre que l'absence de suggestions.

---

## Sécurité

- Les clés API ne sont **jamais** commitées : uniquement en variables d'env.
- Régénérer toute clé qui aurait transité par un canal non sûr (chat, capture…).
- Les RPC de recherche n'exposent que des **identifiants de profils publiés** ;
  les données affichées passent par la vue `public_profiles` (sans contact privé).
- Les deux RPC de recherche sont **SECURITY DEFINER** avec `search_path` figé
  (`public, extensions, pg_temp`). C'est délibéré et plus sûr qu'un `GRANT` :
  elles lisent `search_vector` et `embedding`, colonnes dérivées qui restent
  **inaccessibles** à `anon` et `authenticated`, et ne renvoient qu'un couple
  `(profile_id, score)`. Ni PII, ni vecteur, ni index texte ne quittent la base.
  `extensions` dans le `search_path` est obligatoire : `pg_trgm` et `pgvector`
  y vivent sur Supabase — l'omettre casse `similarity()` et l'opérateur `<=>`.
- Corollaire à retenir : **ne jamais créer une RPC de recherche en
  SECURITY INVOKER**. C'est l'erreur qui a rendu l'annuaire muet du 29/08 au
  01/09, un durcissement de privilèges ayant retiré sous ces fonctions l'accès
  aux colonnes qu'elles lisent.
