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
exports.verifyPhone = exports.requestPhoneVerification = exports.unlockUserPin = exports.verifyPin = exports.deleteMyAccount = exports.deactivateMyAccount = exports.updateMySettings = exports.updateMyProfile = exports.getMyProfile = void 0;
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
    const { first_name, last_name, bio, avatar_url, role, specialty, category, activity_domain, country_id, country_code, country_name, city, job_title, industry, pin_enabled, pin_code, phone, website, is_published, tags, card_variant, slug } = req.body;
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
        // --- SLUG VALIDATION LOGIC ---
        let finalSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "") : null;
        if (finalSlug) {
            const { data: existingSlugProfile } = await supabase_1.supabaseAdmin
                .from('user_profiles')
                .select('user_id')
                .eq('slug', finalSlug)
                .neq('user_id', userId)
                .single();
            if (existingSlugProfile) {
                return res.status(400).json({ error: "Ce lien personnalisé est déjà utilisé par un autre utilisateur." });
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
        // On autorise la suppression du slug si finalSlug est null
        updates.slug = finalSlug;
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
 * Vérifie le code PIN de l'utilisateur
 * POST /api/users/verify-pin
 */
const verifyPin = async (req, res) => {
    const userId = req.user.id;
    const { pin } = req.body;
    try {
        const { data: profile, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('pin_code, pin_attempts, pin_enabled, is_locked')
            .eq('user_id', userId)
            .single();
        if (error || !profile)
            return res.status(400).json({ error: "Profil introuvable" });
        if (!profile.pin_enabled)
            return res.json({ success: true, message: "PIN non activé" });
        if (profile.is_locked) {
            return res.status(403).json({ error: "Compte bloqué après 3 essais infructueux. Veuillez contacter un administrateur.", is_locked: true });
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
            const isNowLocked = newAttempts >= 3;
            await supabase_1.supabaseAdmin
                .from('user_profiles')
                .update({
                pin_attempts: newAttempts,
                ...(isNowLocked ? { is_locked: true, locked_at: new Date().toISOString() } : {})
            })
                .eq('user_id', userId);
            if (isNowLocked) {
                return res.status(403).json({
                    error: "Compte bloqué après 3 essais infructueux. Veuillez contacter un administrateur.",
                    attempts_remaining: 0,
                    is_locked: true
                });
            }
            return res.status(401).json({
                error: "Code PIN incorrect",
                attempts_remaining: 3 - newAttempts
            });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la vérification du PIN" });
    }
};
exports.verifyPin = verifyPin;
/**
 * Débloque le compte utilisateur côté admin
 * POST /api/users/:id/unlock-pin
 */
const unlockUserPin = async (req, res) => {
    const targetUserId = req.params.id;
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .update({ is_locked: false, locked_at: null, pin_attempts: 0 })
            .eq('user_id', targetUserId);
        if (error)
            return res.status(400).json({ error: error.message });
        return res.json({ success: true, message: "Utilisateur débloqué avec succès" });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du déblocage de l'utilisateur" });
    }
};
exports.unlockUserPin = unlockUserPin;
/**
 * Demande un code OTP pour vérifier le téléphone
 * POST /api/users/phone/request
 */
const requestPhoneVerification = async (req, res) => {
    const userId = req.user.id;
    const { phone, method } = req.body; // method: 'whatsapp' | 'sms'
    if (!phone)
        return res.status(400).json({ error: "Numéro de téléphone requis" });
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const { error } = await supabase_1.supabaseAdmin
            .from('phone_verifications')
            .insert({
            user_id: userId,
            phone,
            otp_code: otp,
            expires_at: expiresAt.toISOString()
        });
        if (error)
            throw error;
        // Simulation d'envoi (À remplacer par une API réelle)
        logger_1.logger.info(`[OTP ${method.toUpperCase()}] Pour ${phone}: ${otp}`);
        // Si method === 'whatsapp', on pourrait appeler une API WhatsApp ici
        res.json({ success: true, message: "Code envoyé" });
    }
    catch (err) {
        logger_1.logger.error('Erreur requestPhoneVerification', err);
        res.status(500).json({ error: "Impossible d'envoyer le code" });
    }
};
exports.requestPhoneVerification = requestPhoneVerification;
/**
 * Vérifie le code OTP et certifie le téléphone
 * POST /api/users/phone/verify
 */
const verifyPhone = async (req, res) => {
    const userId = req.user.id;
    const { phone, code } = req.body;
    try {
        const { data: verification, error } = await supabase_1.supabaseAdmin
            .from('phone_verifications')
            .select('*')
            .eq('user_id', userId)
            .eq('phone', phone)
            .eq('otp_code', code)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error || !verification) {
            return res.status(400).json({ error: "Code invalide ou expiré" });
        }
        // Marquer comme vérifié dans la table OTP
        await supabase_1.supabaseAdmin
            .from('phone_verifications')
            .update({ verified: true })
            .eq('id', verification.id);
        // Mettre à jour le profil utilisateur
        const { error: profileError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .update({
            phone_verified: true,
            phone: phone, // S'assurer que le numéro est celui vérifié
            updated_at: new Date().toISOString()
        })
            .eq('user_id', userId);
        if (profileError)
            throw profileError;
        res.json({ success: true, message: "Téléphone vérifié avec succès" });
    }
    catch (err) {
        logger_1.logger.error('Erreur verifyPhone', err);
        res.status(500).json({ error: "Erreur lors de la vérification" });
    }
};
exports.verifyPhone = verifyPhone;
