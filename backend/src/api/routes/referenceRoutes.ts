/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les données de référence (pays, etc.)
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

import { Router } from 'express'
import { getReferenceCountries } from '../../controllers/referenceController'

const router = Router()

// @route   GET /api/reference/countries
// @desc    Récupérer la liste des pays de référence
router.get('/countries', getReferenceCountries)

export default router
