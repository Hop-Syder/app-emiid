/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les données de référence
 * @created 2026-01-05
*/

import { Router } from 'express';
import { getSectors, getProfessions, getCountries } from '../../controllers/referenceController';

const router = Router();

// Routes publiques pour récupérer les listes
router.get('/sectors', getSectors);
router.get('/professions', getProfessions);
router.get('/countries', getCountries);

export default router;
