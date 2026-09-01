/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests de extractSearchTerms — l'extracteur qui alimente le filet
 *              lexical de /api/annuaire quand les RPC de recherche sont HS.
 *
 *              Les cas couverts reprennent les énoncés réels de la dictée vocale,
 *              à l'origine de la panne « zéro profil » : ce sont des phrases
 *              complètes, pas des mots-clés.
 * @created 2026-09-01
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { extractSearchTerms } from '@/lib/search-terms'

describe('extractSearchTerms', () => {
    it('retire les formulations de requête et garde les critères', () => {
        expect(extractSearchTerms('je recherche un couturier à Akpakpa'))
            .toEqual(['couturier', 'akpakpa'])
    })

    it('gère la dictée vocale avec ponctuation et majuscules', () => {
        expect(extractSearchTerms('Bonjour, je voudrais un électricien à Cotonou.'))
            .toEqual(['electricien', 'cotonou'])
    })

    it('normalise les accents pour rejoindre les données non accentuées', () => {
        expect(extractSearchTerms('menuisier à Porto-Novo'))
            .toEqual(['menuisier', 'porto', 'novo'])
    })

    it('ne renvoie jamais de doublon', () => {
        expect(extractSearchTerms('graphiste graphiste freelance'))
            .toEqual(['graphiste', 'freelance'])
    })

    it('retombe sur les mots bruts si la phrase n’est faite que de mots outils', () => {
        // Mieux vaut une recherche large que zéro résultat.
        expect(extractSearchTerms('je cherche quelqu’un').length).toBeGreaterThan(0)
    })

    it('renvoie un tableau vide pour une saisie sans contenu', () => {
        expect(extractSearchTerms('   ')).toEqual([])
        expect(extractSearchTerms('')).toEqual([])
    })

    it('neutralise les caractères qui casseraient un filtre PostgREST', () => {
        // Virgules, parenthèses et % ne doivent jamais atteindre le filtre `or()`.
        const terms = extractSearchTerms('couturier, (Akpakpa) 100%')
        expect(terms.join(' ')).not.toMatch(/[,()%]/)
    })

    it('borne le nombre de termes pour limiter la taille du filtre', () => {
        const long = 'couturier menuisier electricien plombier graphiste soudeur peintre macon'
        expect(extractSearchTerms(long, 3)).toHaveLength(3)
    })
})
