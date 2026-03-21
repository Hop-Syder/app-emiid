"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données de référence (Secteurs, Professions)
 * @created 2026-01-05
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountries = exports.getProfessions = exports.getSectors = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Récupère tous les secteurs d'activité
 */
const getSectors = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('activity_sectors')
            .select('*')
            .order('name');
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des secteurs" });
    }
};
exports.getSectors = getSectors;
/**
 * Récupère les professions, optionnellement filtrées par secteur
 */
const getProfessions = async (req, res) => {
    const { sector_id } = req.query;
    try {
        let query = supabase_1.supabase
            .from('professions')
            .select('*, activity_sectors(name, slug)')
            .order('name');
        if (sector_id) {
            query = query.eq('sector_id', sector_id);
        }
        const { data, error } = await query;
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des professions" });
    }
};
exports.getProfessions = getProfessions;
/**
 * Récupère tous les pays
 */
const getCountries = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('countries')
            .select('*')
            .order('name');
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des pays" });
    }
};
exports.getCountries = getCountries;
