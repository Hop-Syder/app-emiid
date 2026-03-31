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
exports.verifyPin = exports.getPublicProfileById = exports.getPublicProfiles = exports.getAllUsers = exports.deleteMyAccount = exports.deactivateMyAccount = exports.updateMySettings = exports.updateMyProfile = exports.getMyProfile = void 0;
const supabase_1 = require("../config/supabase");
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../utils/logger");
const DEFAULT_NOTIFICATION_PREFERENCES = {
    messages: true,
    network_activity: true,
    newsletter: false,
    push: true,
};
const DEFAULT_APP_PREFERENCES = {
    language: 'fr',
    currency: 'xof',
    timezone: 'gmt',
    theme: 'light',
    public_profile: false,
};
const DEFAULT_SECURITY_PREFERENCES = {
    two_factor_enabled: false,
};
const buildUserSettings = (authUser, isPublished = false) => {
    const metadata = authUser?.user_metadata || {};
    return {
        notification_preferences: {
            ...DEFAULT_NOTIFICATION_PREFERENCES,
            ...(metadata.notification_preferences || {}),
        },
        app_preferences: {
            ...DEFAULT_APP_PREFERENCES,
            ...(metadata.app_preferences || {}),
            public_profile: typeof metadata.app_preferences?.public_profile === 'boolean'
                ? metadata.app_preferences.public_profile
                : isPublished,
        },
        security_preferences: {
            ...DEFAULT_SECURITY_PREFERENCES,
            ...(metadata.security_preferences || {}),
        },
        account_disabled: !!metadata.account_disabled,
    };
};
/**
 * Récupère le profil de l'utilisateur actuellement connecté (via Token Relay)
 * GET /api/users/me
 */
const getMyProfile = async (req, res) => {
    const userId = req.user.id;
    const authUser = req.user;
    const authFallback = {
        first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || null,
        last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || null,
        email: authUser.email || null,
        phone: authUser.phone || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
    };
    try {
        const { data, error } = await supabase_1.supabase
            .from('user_profiles')
            .select('*, countries(name, iso_code), profile_tags(tags(name))')
            .eq('user_id', userId)
            .single();
        if (error) {
            // Si le profil n'existe pas encore, on pourrait renvoyer les infos de base de l'auth
            if (error.code === 'PGRST116') {
                const settings = buildUserSettings(authUser, false);
                return res.json({
                    id: userId,
                    ...authFallback,
                    ...settings,
                    message: "Profil à compléter"
                });
            }
            return res.status(400).json({ error: error.message });
        }
        if (data) {
            data.tags = data.profile_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [];
            delete data.profile_tags;
            data.first_name = data.first_name || authFallback.first_name;
            data.last_name = data.last_name || authFallback.last_name;
            data.email = data.email || authFallback.email;
            data.phone = data.phone || authFallback.phone;
            data.avatar_url = data.avatar_url || authFallback.avatar_url;
            Object.assign(data, buildUserSettings(authUser, !!data.is_published));
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
    const { first_name, last_name, bio, avatar_url, role, specialty, category, activity_domain, country_id, country_code, country_name, city, job_title, industry, pin_enabled, pin_code, phone, website, is_published, tags, card_variant } = req.body;
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
            card_variant,
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
 * Met à jour les paramètres de l'utilisateur connecté dans les metadata auth.
 * PUT /api/users/settings
 */
const updateMySettings = async (req, res) => {
    const userId = req.user.id;
    const authUser = req.user;
    const { notification_preferences, app_preferences, security_preferences, } = req.body || {};
    try {
        const currentMetadata = authUser.user_metadata || {};
        const mergedAppPreferences = {
            ...DEFAULT_APP_PREFERENCES,
            ...(currentMetadata.app_preferences || {}),
            ...(app_preferences || {}),
        };
        const mergedMetadata = {
            ...currentMetadata,
            notification_preferences: {
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                ...(currentMetadata.notification_preferences || {}),
                ...(notification_preferences || {}),
            },
            app_preferences: mergedAppPreferences,
            security_preferences: {
                ...DEFAULT_SECURITY_PREFERENCES,
                ...(currentMetadata.security_preferences || {}),
                ...(security_preferences || {}),
            },
        };
        const { error } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: mergedMetadata,
        });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (typeof mergedAppPreferences.public_profile === 'boolean') {
            const { error: profileError } = await supabase_1.supabaseAdmin
                .from('user_profiles')
                .upsert({
                user_id: userId,
                is_published: mergedAppPreferences.public_profile,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
            if (profileError) {
                return res.status(400).json({ error: profileError.message });
            }
        }
        return res.json(buildUserSettings({ user_metadata: mergedMetadata }, !!mergedAppPreferences.public_profile));
    }
    catch (err) {
        logger_1.logger.error('Erreur updateMySettings', err);
        return res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres" });
    }
};
exports.updateMySettings = updateMySettings;
/**
 * Désactive le compte courant.
 * POST /api/users/account/deactivate
 */
const deactivateMyAccount = async (req, res) => {
    const userId = req.user.id;
    const authUser = req.user;
    try {
        const currentMetadata = authUser.user_metadata || {};
        const mergedMetadata = {
            ...currentMetadata,
            account_disabled: true,
            app_preferences: {
                ...DEFAULT_APP_PREFERENCES,
                ...(currentMetadata.app_preferences || {}),
                public_profile: false,
            },
        };
        const { error: authError } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: mergedMetadata,
        });
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }
        const { error: profileError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .update({ is_published: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        if (profileError) {
            return res.status(400).json({ error: profileError.message });
        }
        return res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Erreur deactivateMyAccount', err);
        return res.status(500).json({ error: 'Erreur lors de la désactivation du compte' });
    }
};
exports.deactivateMyAccount = deactivateMyAccount;
/**
 * Supprime définitivement le compte courant.
 * DELETE /api/users/account
 */
const deleteMyAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        const { error } = await supabase_1.supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Erreur deleteMyAccount', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }
};
exports.deleteMyAccount = deleteMyAccount;
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
        logger_1.logger.debug('Public profiles query params', req.query);
        // Filtrage manuel pour les Tags (limitation Supabase JS Client simple)
        if (tags && data) {
            const tagSearch = tags.toLowerCase();
            data = data.filter((profile) => profile.profile_tags?.some((pt) => pt.tags?.name?.toLowerCase().includes(tagSearch)));
        }
        // FallbackDev (Seulement si aucune data ET ABSOLUMENT AUCUN filtre restrictif)
        const hasAnyFilter = !!(category || search || country || city || tags);
        if (!error && (!data || data.length === 0) && !hasAnyFilter) {
            logger_1.logger.debug('FallbackDev: serving latest profiles without filters');
            const fallback = await supabase_1.supabaseAdmin
                .from('user_profiles')
                .select(`*, countries(name, iso_code)`)
                .eq('is_published', true) // Toujours filtrer sur published même en fallback
                .limit(6)
                .order('created_at', { ascending: false });
            data = fallback.data;
        }
        if (error) {
            logger_1.logger.error('Error fetching public profiles', error);
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
            .eq('is_published', true)
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
