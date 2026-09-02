/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests des gardes de routes de l'annuaire. Un segment d'URL non
 *              reconnu doit être rejeté : sans cela, /annuaire/[category]
 *              répondait 200 sur un nombre illimité d'URL fabriquées.
 * @created 2026-09-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import {
    resolveProfileCategory,
    categoryLabel,
    PROFILE_CATEGORIES,
} from '@/lib/profile-options'

describe('resolveProfileCategory', () => {
    it('accepte une catégorie connue', () => {
        expect(resolveProfileCategory('artisan')?.value).toBe('artisan')
        expect(resolveProfileCategory('freelance')?.value).toBe('freelance')
    })

    it('accepte toutes les catégories déclarées', () => {
        for (const c of PROFILE_CATEGORIES) {
            expect(resolveProfileCategory(c.value)?.value).toBe(c.value)
        }
    })

    it('tolère la casse', () => {
        expect(resolveProfileCategory('Artisan')?.value).toBe('artisan')
        expect(resolveProfileCategory('ONG')?.value).toBe('ong')
    })

    it('gère un segment encodé (accents dans l’URL)', () => {
        // « commerçante » voyage encodé dans une URL.
        expect(resolveProfileCategory('commer%C3%A7ante')?.value).toBe('commerçante')
    })

    it('rejette un segment inventé', () => {
        expect(resolveProfileCategory('nimportequoi')).toBeNull()
        expect(resolveProfileCategory('../etc/passwd')).toBeNull()
        expect(resolveProfileCategory('')).toBeNull()
        expect(resolveProfileCategory('   ')).toBeNull()
    })

    it('rejette les catégories fantômes de l’ancien sitemap', () => {
        // Elles n'ont jamais existé dans PROFILE_CATEGORIES : ces URL étaient
        // listées au sitemap alors qu'aucun profil ne pouvait les porter.
        for (const ghost of ['sante', 'education', 'restauration', 'commerce']) {
            expect(resolveProfileCategory(ghost)).toBeNull()
        }
    })
})

describe('categoryLabel', () => {
    it('retire l’emoji de tête', () => {
        expect(categoryLabel({ value: 'artisan', label: '🎨 Artisan' })).toBe('Artisan')
        expect(categoryLabel({ value: 'ong', label: '🌍 ONG / Association' })).toBe(
            'ONG / Association'
        )
    })

    it('ne laisse jamais d’emoji dans un libellé de catégorie', () => {
        for (const c of PROFILE_CATEGORIES) {
            const label = categoryLabel(c)
            expect(label.length).toBeGreaterThan(0)
            // Un libellé doit commencer par une lettre, pas par un pictogramme.
            expect(/^\p{L}/u.test(label)).toBe(true)
        }
    })
})
