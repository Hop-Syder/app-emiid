/**
 * Cache TTL minimaliste en mémoire, typé.
 * - Une clé → une valeur + expiration absolue (epoch ms).
 * - `get()` renvoie `null` si absent ou expiré (et purge la ligne).
 * - Sérialisation des requêtes concurrentes : si un calcul est déjà en cours
 *   pour la même clé, les appels suivants attendent le même résultat
 *   (évite le "cache stampede" quand 100 requêtes arrivent après expiration).
 *
 * Limites connues :
 * - Pas de persistance (s'efface au restart — acceptable pour un TTL court).
 * - Pas de partage entre plusieurs instances backend (si tu scales horizontalement,
 *   migrer vers Redis).
 */

type CacheEntry<T> = { value: T; expiresAt: number };
type PendingEntry<T> = Promise<T>;

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private pending = new Map<string, PendingEntry<T>>();

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Récupère la valeur cachée, ou calcule-la via `loader` si absente/expirée.
   * Partage le même `Promise` entre appels concurrents.
   */
  async getOrLoad(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const inflight = this.pending.get(key);
    if (inflight) return inflight;

    const promise = loader()
      .then((value) => {
        this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.pending.clear();
  }
}
