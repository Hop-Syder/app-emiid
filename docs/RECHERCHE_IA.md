# Recherche annuaire — architecture IA (gratuite, dégradation propre)

La recherche de profils EmiID est construite en **couches empilées**. Chaque
couche améliore la pertinence, mais **aucune n'est indispensable** : si une clé
API manque ou qu'un service est indisponible, la recherche retombe
automatiquement sur la couche inférieure. **Elle fonctionne toujours.**

| Couche | Rôle | Techno | Coût | Clé requise |
|--------|------|--------|------|-------------|
| ① Lexicale | multi-mots, radicalisation FR, fautes de frappe | Postgres FTS `french` + `pg_trgm` | gratuit | — |
| ② Sémantique | comprendre le *sens* (« refaire mon élec » → électricien) | pgvector + embeddings Gemini | gratuit | `GEMINI_API_KEY` |
| ③ Intention / reco | reformuler & recommander quand 0 résultat | Groq (Llama) | gratuit | `GROQ_API_KEY` |

```
requête ──► ① FTS (toujours) ─┐
        └─► ② sémantique (si clé) ─┤──► fusion RRF ──► profils classés
                                    └─(0 résultat)──► ③ assistant/reco (Groq)
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

- **Migration :** `sql/migrations/20260821_semantic_search.sql`
  (extension `vector`, colonne `embedding vector(768)`, `embedding_stale`,
  trigger de péremption, index HNSW cosinus, RPC `match_profiles_semantic`).
- **Embedding requête :** `frontend-user/lib/embeddings.ts` (`text-embedding-004`,
  768 dims, `taskType=RETRIEVAL_QUERY`, timeout 3,5 s, renvoie `null` si indispo).
- **Backfill profils :** `backend/scripts/embed-profiles.js`
  (`taskType=RETRIEVAL_DOCUMENT`).
- **Fusion :** dans la route annuaire, les classements ① et ② sont combinés par
  **Reciprocal Rank Fusion** (RRF, `K=60`, poids FTS 1,0 / sémantique 0,9) —
  robuste aux échelles de score différentes.

### Mise en service (3 étapes)

1. **Jouer la migration** dans le SQL Editor Supabase :
   `sql/migrations/20260821_semantic_search.sql`.

2. **Variables d'environnement :**

   | Où | Variable | Valeur |
   |----|----------|--------|
   | Vercel `frontend-user` | `GEMINI_API_KEY` | clé Google AI Studio (`AIza…`) |
   | Backend `.env` (Render/local) | `SUPABASE_URL` | URL du projet |
   | Backend `.env` | `SUPABASE_SERVICE_ROLE_KEY` | clé *service role* |
   | Backend `.env` | `GEMINI_API_KEY` | même clé Gemini |

   > La clé Gemini se crée sur https://aistudio.google.com/apikey (bouton
   > **Create API key**). Une clé valide commence par `AIza…`.

3. **Générer les vecteurs** (une fois, puis périodiquement) :

   ```bash
   cd backend
   node scripts/embed-profiles.js         # n'embarque que les profils périmés
   node scripts/embed-profiles.js --all   # tout re-embarquer (changement de modèle)
   ```

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

## Couche ③ — Intention & recommandations  *(actif si `GROQ_API_KEY`)*

Se déclenche sur le cas **0 résultat** dans l'annuaire : Groq (Llama) génère un
message empathique + 3 à 5 **suggestions de recherche cliquables** (métier +
ville réalistes au Bénin), qui relancent la recherche.

- **Helper :** `frontend-user/lib/groq.ts` (`searchAssistant()`, modèle
  `llama-3.3-70b-versatile`, JSON mode, timeout 6 s, renvoie `null` si indispo).
- **Endpoint :** `frontend-user/app/api/search-assistant/route.ts` (`GET ?q=`).
- **UI :** `frontend-user/components/annuaire-public-content/search-assistant.tsx`,
  affiché sous l'état vide de `annuaire-grid.tsx` quand une recherche est active.

### Mise en service

| Où | Variable | Valeur |
|----|----------|--------|
| Vercel `frontend-user` | `GROQ_API_KEY` | clé Groq (https://console.groq.com) |
| Vercel `frontend-user` | `GROQ_MODEL` *(optionnel)* | défaut `llama-3.3-70b-versatile` |

La clé Groq se crée gratuitement (sans carte bancaire) dans la console Groq →
*API Keys*. Free tier largement suffisant : l'assistant n'est appelé **que** sur
une recherche à 0 résultat.

### Dégradation

Sans `GROQ_API_KEY`, en cas de quota ou d'erreur/timeout, l'endpoint renvoie une
charge vide et **aucun bloc assistant ne s'affiche** — l'état vide standard
(« Aucun résultat trouvé » + réinitialiser les filtres) reste inchangé.

---

## Sécurité

- Les clés API ne sont **jamais** commitées : uniquement en variables d'env.
- Régénérer toute clé qui aurait transité par un canal non sûr (chat, capture…).
- Les RPC de recherche n'exposent que des **identifiants de profils publiés** ;
  les données affichées passent par la vue `public_profiles` (sans contact privé).
