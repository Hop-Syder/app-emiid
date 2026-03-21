"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPin = exports.getPublicProfileById = exports.getPublicProfiles = exports.getAllUsers = exports.updateMyProfile = exports.getMyProfile = void 0;
const supabase_1 = require("../config/supabase");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Récupère le profil de l'utilisateur actuellement connecté (via Token Relay)
 * GET /api/users/me
 */
const getMyProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase_1.supabase
            .from('user_profiles')
            .select('*, countries(name, iso_code), profile_tags(tags(name))')
            .eq('user_id', userId)
            .single();
        if (error) {
            // Si le profil n'existe pas encore, on pourrait renvoyer les infos de base de l'auth
            if (error.code === 'PGRST116') {
                return res.json({
                    id: userId,
                    email: req.user.email,
                    message: "Profil à compléter"
                });
            }
            return res.status(400).json({ error: error.message });
        }
        if (data) {
            data.tags = data.profile_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [];
            delete data.profile_tags;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
    }
};
exports.getMyProfile = getMyProfile;
/**
 * Met à jour le profil de l'utilisateur connecté
 * PUT /api/users/me
 */
const updateMyProfile = async (req, res) => {
    const userId = req.user.id;
    const { first_name, last_name, bio, avatar_url, role, specialty, category, activity_domain, country_id, country_code, country_name, city, job_title, industry, pin_enabled, pin_code, phone, website, is_published, tags } = req.body;
    try {
        let finalCountryId = country_id;
        // Si on a un code pays mais pas d'ID, on cherche ou on crée
        if (!finalCountryId && country_code) {
            const { data: countryData, error: countryError } = await supabase_1.supabase
                .from('countries')
                .select('id')
                .eq('iso_code', country_code)
                .single();
            if (countryData) {
                finalCountryId = countryData.id;
            }
            else {
                // Créer le pays s'il n'existe pas
                const { data: newCountry, error: createError } = await supabase_1.supabase
                    .from('countries')
                    .insert({ name: country_name, iso_code: country_code })
                    .select()
                    .single();
                if (newCountry)
                    finalCountryId = newCountry.id;
            }
        }
        // --- SMART AUTOCOMPLETE LOGIC ---
        // On utilise 'role' ou 'job_title' pour alimenter 'jobs'
        const finalRole = role || job_title;
        if (finalRole) {
            await supabase_1.supabaseAdmin.from('jobs').upsert({ name: finalRole }, { onConflict: 'name' });
        }
        // On utilise 'activity_domain' ou 'industry' pour 'industries'
        const finalDomain = activity_domain || industry;
        if (finalDomain) {
            await supabase_1.supabaseAdmin.from('industries').upsert({ name: finalDomain }, { onConflict: 'name' });
        }
        // --- PIN SECURITY LOGIC ---
        // Construction sécurisée de l'objet updates pour éviter les erreurs de colonnes inexistantes
        const updates = {
            user_id: userId,
            first_name,
            last_name,
            bio,
            avatar_url,
            role: finalRole,
            specialty,
            category,
            activity_domain: finalDomain,
            country_id: finalCountryId,
            city,
            phone,
            website,
            is_published,
            updated_at: new Date().toISOString()
        };
        // Ajout conditionnel des champs PIN (seulement si présents)
        if (pin_enabled !== undefined)
            updates.pin_enabled = pin_enabled;
        // Si un nouveau code PIN est envoyé, on le hashe
        if (pin_code && pin_code.length === 6) {
            const salt = await bcrypt_1.default.genSalt(10);
            updates.pin_code = await bcrypt_1.default.hash(pin_code, salt);
            updates.pin_attempts = 0;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .upsert(updates, { onConflict: 'user_id' })
            .select()
            .single();
        if (error)
            return res.status(400).json({ error: error.message });
        // --- TAGS LOGIC ---
        if (tags && Array.isArray(tags)) {
            const profileId = data.id;
            // Supprimer les anciens tags
            await supabase_1.supabaseAdmin.from('profile_tags').delete().eq('profile_id', profileId);
            for (const tagName of tags) {
                const cleanTag = tagName.toLowerCase().trim();
                if (cleanTag) {
                    // Upsert tag
                    const { data: tagData } = await supabase_1.supabaseAdmin.from('tags').upsert({ name: cleanTag }, { onConflict: 'name' }).select('id').single();
                    if (tagData) {
                        await supabase_1.supabaseAdmin.from('profile_tags').insert({ profile_id: profileId, tag_id: tagData.id });
                    }
                }
            }
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la mise à jour du profil" });
    }
};
exports.updateMyProfile = updateMyProfile;
/**
 * Récupère tous les profils (public)
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    const { category } = req.query;
    try {
        let query = supabase_1.supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (category) {
            query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des profils" });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * Récupère uniquement les profils publiés (public, pas d'auth requise)
 * GET /api/public/profiles
 */
const getPublicProfiles = async (req, res) => {
    const { category, search, country, city, tags } = req.query;
    try {
        let query = supabase_1.supabaseAdmin
            .from('user_profiles')
            .select(`
        *,
        countries(name, iso_code),
        profile_tags(tags(name))
      `)
            .eq('is_published', true)
            .order('updated_at', { ascending: false });
        // Filtre Catégorie (Case-insensitive pour éviter les mismatchs SN/sn ou Freelance/freelance)
        if (category) {
            query = query.ilike('category', category);
        }
        // Filtre Pays (via le code ISO de la relation countries)
        if (country) {
            query = query.eq('countries.iso_code', country);
        }
        // Filtre Ville
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        // Filtre Tags (Recherche simple si un tag est spécifié)
        // Note: Le filtrage profond sur tags via PostgREST est limité sans extension.
        // On suppose ici que si 'tags' est présent, c'est une string de recherche.
        // Pour une vraie recherche par tags exacte, il faudrait une vue ou une func RPC.
        // Ici on fait un fallback simple sur le champ texte si 'tags' est passé comme paramètre de recherche
        // OU BIEN on compte sur le Frontend pour envoyer le tag dans 'search' si pas géré spécifiquement.
        // Mais le user veut un filtre spécifique.
        // Approche pragmatique : Si 'tags' est présent, on filtre ceux qui ont ce tag dans profile_tags
        // Cela nécessite !inner sur profile_tags.
        if (tags) {
            // Cette syntaxe suppose que profile_tags a été joint avec !inner (ce qui est le cas si on filtre dessus)
            // query = query.eq('profile_tags.tags.name', tags) // Difficile avec la structure actuelle sans casser la lecture
        }
        // Recherche Textuelle (Nom, Bio, Rôle)
        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,bio.ilike.%${search}%,role.ilike.%${search}%,specialty.ilike.%${search}%`);
        }
        let { data, error } = await query;
        console.log('Public Profiles query params:', req.query);
        // Filtrage manuel pour les Tags (limitation Supabase JS Client simple)
        if (tags && data) {
            const tagSearch = tags.toLowerCase();
            data = data.filter((profile) => profile.profile_tags?.some((pt) => pt.tags?.name?.toLowerCase().includes(tagSearch)));
        }
        // FallbackDev (Seulement si aucune data ET ABSOLUMENT AUCUN filtre restrictif)
        const hasAnyFilter = !!(category || search || country || city || tags);
        if (!error && (!data || data.length === 0) && !hasAnyFilter) {
            console.log('FallbackDev: Serving mock/latest profiles (No filters applied)');
            const fallback = await supabase_1.supabaseAdmin
                .from('user_profiles')
                .select(`*, countries(name, iso_code)`)
                .eq('is_published', true) // Toujours filtrer sur published même en fallback
                .limit(6)
                .order('created_at', { ascending: false });
            data = fallback.data;
        }
        if (error) {
            console.error('Error fetching public profiles:', error);
            return res.status(400).json({ error: error.message });
        }
        // Nettoyage de la structure pour le frontend (aplatir tags)
        const cleanedData = data?.map((p) => ({
            ...p,
            tags: p.profile_tags?.map((pt) => pt.tags?.name) || []
        }));
        res.json(cleanedData);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des profils publics" });
    }
};
exports.getPublicProfiles = getPublicProfiles;
/**
 * Récupère un profil public par son ID
 * GET /api/public/profiles/:id
 */
const getPublicProfileById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select(`
        *,
        countries(name, iso_code),
        profile_tags(tags(name))
      `)
            .eq('user_id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Profil non trouvé" });
            }
            return res.status(400).json({ error: error.message });
        }
        if (data) {
            data.tags = data.profile_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [];
            delete data.profile_tags;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
    }
};
exports.getPublicProfileById = getPublicProfileById;
/**
 * Vérifie le code PIN de l'utilisateur
 * POST /api/users/verify-pin
 */
const verifyPin = async (req, res) => {
    const userId = req.user.id;
    const { pin } = req.body;
    try {
        const { data: profile, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('pin_code, pin_attempts, pin_enabled')
            .eq('user_id', userId)
            .single();
        if (error || !profile)
            return res.status(400).json({ error: "Profil introuvable" });
        if (!profile.pin_enabled)
            return res.json({ success: true, message: "PIN non activé" });
        if (profile.pin_attempts >= 6) {
            return res.status(403).json({ error: "Compte bloqué après 6 essais infructueux. Veuillez contacter le support." });
        }
        const isMatch = await bcrypt_1.default.compare(pin, profile.pin_code);
        if (isMatch) {
            // Réinitialiser les tentatives si succès
            await supabase_1.supabaseAdmin
                .from('user_profiles')
                .update({ pin_attempts: 0 })
                .eq('user_id', userId);
            return res.json({ success: true });
        }
        else {
            // Incrémenter les tentatives
            const newAttempts = (profile.pin_attempts || 0) + 1;
            await supabase_1.supabaseAdmin
                .from('user_profiles')
                .update({ pin_attempts: newAttempts })
                .eq('user_id', userId);
            return res.status(401).json({
                error: "Code PIN incorrect",
                attempts_remaining: 6 - newAttempts
            });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la vérification du PIN" });
    }
};
exports.verifyPin = verifyPin;
