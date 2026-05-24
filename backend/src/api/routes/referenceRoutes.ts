/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les données de référence (pays, etc.)
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
// ──────────────────────────────────

import { Router } from 'express'
import { getReferenceCountries, getReferenceSectors, getReferenceProfessions } from '../../controllers/referenceController'

const router = Router()

// @route   GET /api/reference/countries
// @desc    Récupérer la liste des pays de référence
router.get('/countries', getReferenceCountries)

// @route   GET /api/reference/sectors
// @desc    Récupérer la liste des secteurs d'activité de référence
router.get('/sectors', getReferenceSectors)

// @route   GET /api/reference/professions
// @desc    Récupérer la liste des professions de référence
router.get('/professions', getReferenceProfessions)

export default router
