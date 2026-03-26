"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Controleur pour les donnees de reference (secteurs, professions, pays)
 * @created 2026-01-05
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountries = exports.getProfessions = exports.getSectors = void 0;
const supabase_1 = require("../config/supabase");
const getSectors = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('activity_sectors')
            .select('*')
            .order('name');
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur lors de la recuperation des secteurs" });
    }
};
exports.getSectors = getSectors;
const getProfessions = async (req, res) => {
    const { sector_id } = req.query;
    try {
        let query = supabase_1.supabaseAdmin
            .from('professions')
            .select('*, activity_sectors(name, slug)')
            .order('name');
        if (sector_id) {
            query = query.eq('sector_id', sector_id);
        }
        const { data, error } = await query;
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur lors de la recuperation des professions" });
    }
};
exports.getProfessions = getProfessions;
const getCountries = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('countries')
            .select('*')
            .order('name');
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur lors de la recuperation des pays" });
    }
};
exports.getCountries = getCountries;
