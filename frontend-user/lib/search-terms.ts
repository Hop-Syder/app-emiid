/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Extraction des termes utiles d'une requête en langage naturel.
 *
 *              La dictée vocale et la saisie libre produisent des phrases
 *              (« je recherche un couturier à Akpakpa ») et non des mots-clés.
 *              Le nettoyage est déjà fait en SQL par search_profile_ids() ; ce
 *              module en fournit l'équivalent côté Node pour le filet de
 *              sécurité lexical de /api/annuaire, utilisé quand les RPC de
 *              recherche sont indisponibles.
 *
 *              Les deux listes de mots sont volontairement identiques à celles
 *              de la migration 20260828_search_natural_language.sql : un même
 *              énoncé doit produire les mêmes termes des deux côtés.
 * @created 2026-09-01
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

/**
 * Formulations de requête et mots outils : ce sont des marqueurs d'intention,
 * jamais des critères de recherche. Miroir de la regex SQL `cleaned`.
 */
const STOP_WORDS = new Set([
    // Formulations de requête
    "je", "j", "jai", "recherche", "rechercher", "cherche", "chercher",
    "chercherais", "veux", "voudrais", "souhaite", "besoin", "faut",
    "trouve", "trouver", "quelqu", "quelquun", "serait", "urgent", "urgente",
    "svp", "stp", "sil", "plait", "plait", "merci", "bonjour", "salut",
    // Pronoms et déterminants
    "moi", "mon", "ma", "mes", "nous", "vous", "me", "te", "se", "on",
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "au", "aux",
    "ce", "cet", "cette", "ces", "son", "sa", "ses", "leur", "leurs",
    // Prépositions et liaisons
    "pour", "avec", "dans", "chez", "vers", "aupres", "autour", "pres",
    "a", "en", "et", "ou", "que", "qui", "quoi", "sur", "sous", "par",
    "est", "sont", "etre", "avoir",
])

/**
 * Réduit un texte à sa forme comparable : minuscules, sans accents,
 * apostrophes et ponctuation ramenées à des espaces.
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        // Retire les diacritiques (é → e) pour que « près » et « pres » se rejoignent.
        .replace(/[\u0300-\u036f]/g, "")
        // Apostrophes droites et typographiques → séparateur de mots.
        .replace(/['’]/g, " ")
        // Tout ce qui n'est ni lettre ni chiffre devient un espace : cela neutralise
        // au passage les caractères qui casseraient un filtre PostgREST (, ( ) %).
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
}

/**
 * Extrait les termes significatifs d'une requête en langage naturel.
 *
 * @param query    Saisie brute (frappe ou dictée vocale).
 * @param maxTerms Nombre maximum de termes conservés — borne la taille du
 *                 filtre envoyé à PostgREST.
 * @returns Les termes utiles, sans doublon. Tableau vide si la requête ne
 *          contient aucun critère exploitable.
 *
 * @example extractSearchTerms("je recherche un couturier à Akpakpa")
 *          → ["couturier", "akpakpa"]
 */
export function extractSearchTerms(query: string, maxTerms = 6): string[] {
    const normalized = normalize(query || "")
    if (!normalized) return []

    const meaningful = normalized
        .split(" ")
        // Un mot d'une seule lettre n'apporte rien et fait exploser le bruit du LIKE.
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word))

    // Si la phrase n'était composée que de mots outils (« je cherche quelqu'un »),
    // on retombe sur les mots bruts : mieux vaut un résultat large que zéro.
    const source = meaningful.length > 0
        ? meaningful
        : normalized.split(" ").filter((word) => word.length > 1)

    return Array.from(new Set(source)).slice(0, maxTerms)
}
