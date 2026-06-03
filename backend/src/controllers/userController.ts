/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
 * @updated 2026-06-03
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';
import { UserProfile } from '../types/models';
import { 
  updateProfileSchema, 
  updateSettingsSchema, 
  verifyPinSchema, 
  requestPhoneVerificationSchema, 
  verifyPhoneSchema 
} from '../api/validations/userValidations';

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

const buildUserSettings = (authUser: any, isPublished = false) => {
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
export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const authUser = req.user;
  if (!userId || !authUser) return res.status(401).json({ error: "Non authentifié" });
  
  const authFallback = {
    first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || null,
    last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || null,
    email: authUser.email || null,
    phone: authUser.phone || null,
    avatar_url: authUser.user_metadata?.avatar_url || null,
  };

  try {
    const { data, error } = await supabaseAdmin
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
      logger.error('Supabase getMyProfile error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId
      });
      return res.status(400).json({ error: error.message });
    }

    if (data) {
        data.tags = data.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
        delete data.profile_tags;
        data.first_name = data.first_name || authFallback.first_name;
        data.last_name = data.last_name || authFallback.last_name;
        data.email = data.email || authFallback.email;
        data.phone = data.phone || authFallback.phone;
        data.avatar_url = data.avatar_url || authFallback.avatar_url;
        Object.assign(data, buildUserSettings(authUser, !!data.is_published));
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * PUT /api/users/me
 */
export const updateMyProfile = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { body } = updateProfileSchema.parse(req) as { body: any };
    const { 
      first_name, last_name, bio, avatar_url,
      role, specialty, category, activity_domain,
      country_id, country_code, country_name, city,
      job_title, industry, pin_enabled, pin_code,
      phone, website, is_published, tags, card_variant, slug
    } = body;

    let finalCountryId = country_id;

    // Si on a un code pays mais pas d'ID, on cherche ou on crée
    if (!finalCountryId && country_code) {
      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('iso_code', country_code)
        .single();

      if (countryData) {
        finalCountryId = countryData.id;
      } else {
        // Créer le pays s'il n'existe pas
        const { data: newCountry, error: createError } = await supabase
          .from('countries')
          .insert({ name: country_name, iso_code: country_code })
          .select()
          .single();
        
        if (newCountry) finalCountryId = newCountry.id;
      }
    }

    // --- SLUG VALIDATION LOGIC ---
    let finalSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "") : null;
    if (finalSlug) {
      const { data: existingSlugProfile } = await supabaseAdmin
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
      await supabaseAdmin.from('jobs').upsert({ name: finalRole }, { onConflict: 'name' });
    }
    // activity_domain est la source canonique; industry reste un fallback legacy.
    const finalDomain = activity_domain !== undefined ? activity_domain : industry;
    if (finalDomain) {
      await supabaseAdmin.from('industries').upsert({ name: finalDomain }, { onConflict: 'name' });
    }

    // --- PIN SECURITY LOGIC ---
    const updates: any = { 
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
        has_profile: true,
        updated_at: new Date().toISOString()
    };
    
    // On autorise la suppression du slug si finalSlug est null
    updates.slug = finalSlug;

    // Ajout conditionnel des champs PIN (seulement si présents)
    if (pin_enabled !== undefined) updates.pin_enabled = pin_enabled;

    // Si un nouveau code PIN est envoyé, on le hashe
    if (pin_code && pin_code.length === 6) {
      const salt = await bcrypt.genSalt(10);
      updates.pin_code = await bcrypt.hash(pin_code, salt);
      updates.pin_attempts = 0;
    }

    // Tenter d'abord une mise à jour via UPDATE
    let { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    // S'il n'y avait aucun enregistrement existant, procéder à une insertion (INSERT)
    if (!error && !data) {
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert(updates)
        .select()
        .single();
      
      data = insertedData;
      error = insertError;
    }

    if (error || !data) {
      logger.error('Supabase updateMyProfile error details:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        userId
      });
      return res.status(400).json({ error: error?.message || "Impossible de sauvegarder le profil" });
    }
    
    // --- TAGS LOGIC ---
    if (tags && Array.isArray(tags)) {
        const profileId = data.id;
        try {
            // Supprimer les anciens tags
            const { error: deleteError } = await supabaseAdmin.from('profile_tags').delete().eq('profile_id', profileId);
            if (deleteError) {
                logger.error('Erreur lors de la suppression des anciennes liaisons profile_tags:', deleteError);
            }
            
            // Filtrer pour éliminer les doublons éventuels du tableau
            const uniqueTags = Array.from(new Set(tags));
            
            for (const tagName of uniqueTags) {
                const cleanTag = tagName.toLowerCase().trim();
                if (cleanTag) {
                    // Étape 1 : Récupérer le tag s'il existe déjà
                    const { data: existingTag, error: selectError } = await supabaseAdmin
                        .from('tags')
                        .select('id')
                        .eq('name', cleanTag)
                        .maybeSingle();

                    let finalTagId = existingTag?.id;

                    if (selectError) {
                        logger.error(`Erreur lors de la recherche du tag "${cleanTag}":`, selectError);
                    }

                    // Étape 2 : Si le tag n'existe pas, on tente de l'insérer
                    if (!finalTagId) {
                        const { data: newTag, error: insertError } = await supabaseAdmin
                            .from('tags')
                            .insert({ name: cleanTag })
                            .select('id')
                            .maybeSingle();

                        finalTagId = newTag?.id;

                        // Étape 3 : Si conflit d'unicité concurrent (insertError de type duplicate key), on ré-essaie de le lire
                        if (insertError) {
                            if (insertError.code === '23505') {
                                const { data: retryTag } = await supabaseAdmin
                                    .from('tags')
                                    .select('id')
                                    .eq('name', cleanTag)
                                    .maybeSingle();
                                finalTagId = retryTag?.id;
                            } else {
                                logger.error(`Erreur d'insertion du tag "${cleanTag}":`, insertError);
                            }
                        }
                    }

                    // Étape 4 : Lier le tag au profil (un simple insert est suffisant et beaucoup plus robuste)
                    if (finalTagId) {
                        const { error: ptError } = await supabaseAdmin
                            .from('profile_tags')
                            .insert({ profile_id: profileId, tag_id: finalTagId });
                        
                        if (ptError) {
                            logger.error(`Erreur lors de la liaison du tag "${cleanTag}" (ID: ${finalTagId}) au profil (ID: ${profileId}):`, ptError);
                        }
                    } else {
                        logger.error(`Impossible d'obtenir un ID de tag valide pour "${cleanTag}"`);
                    }
                }
            }
        } catch (tagsCatchErr) {
            logger.error('Exception capturée durant la sauvegarde des tags du profil:', tagsCatchErr);
        }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la mise à jour du profil" });
  }
};

/**
 * Met à jour les paramètres de l'utilisateur connecté dans les metadata auth.
 * PUT /api/users/settings
 */
export const updateMySettings = async (req: any, res: Response) => {
  const userId = req.user.id;
  const authUser = req.user;

  try {
    const { body } = updateSettingsSchema.parse(req) as { body: any };
    const {
      notification_preferences,
      app_preferences,
      security_preferences,
    } = body;

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

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: mergedMetadata,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (typeof mergedAppPreferences.public_profile === 'boolean') {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            is_published: mergedAppPreferences.public_profile,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }
    }

    return res.json(buildUserSettings({ user_metadata: mergedMetadata }, !!mergedAppPreferences.public_profile));
  } catch (err) {
    logger.error('Erreur updateMySettings', err);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres" });
  }
};

/**
 * Désactive le compte courant.
 * POST /api/users/account/deactivate
 */
export const deactivateMyAccount = async (req: any, res: Response) => {
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

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: mergedMetadata,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error('Erreur deactivateMyAccount', err);
    return res.status(500).json({ error: 'Erreur lors de la désactivation du compte' });
  }
};

/**
 * Supprime définitivement le compte courant.
 * DELETE /api/users/account
 */
export const deleteMyAccount = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error('Erreur deleteMyAccount', err);
    return res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
};

/**
 * Vérifie le code PIN de l'utilisateur
 * POST /api/users/verify-pin
 */
export const verifyPin = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  try {
    const { body: { pin } } = verifyPinSchema.parse(req);
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('pin_code, pin_attempts, pin_enabled, is_locked, locked_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) return res.status(400).json({ error: "Profil introuvable" });
    const profile = data as UserProfile;

    if (!profile.pin_enabled || !profile.pin_code) return res.json({ success: true, message: "PIN non activé" });

    if (profile.is_locked && profile.locked_at) {
      const attempts = profile.pin_attempts || 3;
      // Délai exponentiel : 1 min, 5 min, 15 min, 1h, 24h
      const delays = [0, 0, 0, 1, 5, 15, 60, 1440]; // index = attempts
      const delayMinutes = attempts < delays.length ? delays[attempts] : 1440;
      
      const lockTime = new Date(profile.locked_at!).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lockTime) / (1000 * 60);

      if (diffMinutes < delayMinutes) {
        const remainingMinutes = Math.ceil(delayMinutes - diffMinutes);
        return res.status(403).json({ 
          error: `Compte temporairement bloqué. Veuillez réessayer dans ${remainingMinutes} minute(s).`, 
          is_locked: true,
          remaining_minutes: remainingMinutes
        });
      }
      
      // Le délai est écoulé, on autorise la tentative mais on garde is_locked tant qu'on n'a pas réussi
    }

    const isMatch = await bcrypt.compare(pin, profile.pin_code);

    if (isMatch) {
      // Réinitialiser les tentatives si succès
      await supabaseAdmin
        .from('user_profiles')
        .update({ pin_attempts: 0 })
        .eq('user_id', userId);
      
      return res.json({ success: true });
    } else {
      // Incrémenter les tentatives
      const newAttempts = (profile.pin_attempts || 0) + 1;
      const shouldLock = newAttempts >= 3;

      await supabaseAdmin
        .from('user_profiles')
        .update({ 
          pin_attempts: newAttempts,
          ...(shouldLock ? { is_locked: true, locked_at: new Date().toISOString() } : {})
        })
        .eq('user_id', userId);
      
      if (shouldLock) {
        const delays = [0, 0, 0, 1, 5, 15, 60, 1440];
        const delayMinutes = newAttempts < delays.length ? delays[newAttempts] : 1440;

        return res.status(403).json({ 
          error: `Code PIN incorrect. Compte bloqué pour ${delayMinutes} minute(s).`, 
          attempts_remaining: 0,
          is_locked: true,
          next_retry_in: delayMinutes
        });
      }

      return res.status(401).json({ 
        error: "Code PIN incorrect", 
        attempts_remaining: 3 - newAttempts 
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification du PIN" });
  }
};

/**
 * Débloque le compte utilisateur côté admin
 * POST /api/users/:id/unlock-pin
 */
export const unlockUserPin = async (req: Request, res: Response) => {
  const { id: targetUserId } = z.object({ id: z.string().uuid() }).parse(req.params);

  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_locked: false, locked_at: null, pin_attempts: 0 })
      .eq('user_id', targetUserId);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ success: true, message: "Utilisateur débloqué avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du déblocage de l'utilisateur" });
  }
};

/**
 * Réinitialise le code PIN de l'utilisateur connecté
 * Appelé après vérification d'identité via Supabase reauthenticate (OTP par email)
 * POST /api/users/reset-pin
 */
export const resetMyPin = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        pin_enabled: false,
        pin_code: null,
        pin_attempts: 0,
        is_locked: false,
        locked_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      logger.error("Erreur réinitialisation PIN:", error);
      return res.status(400).json({ error: "Impossible de réinitialiser le PIN" });
    }

    logger.info(`PIN réinitialisé pour l'utilisateur ${userId}`);
    return res.json({ success: true, message: "Code PIN désactivé et réinitialisé avec succès" });
  } catch (err) {
    logger.error("Erreur serveur réinitialisation PIN:", err);
    res.status(500).json({ error: "Erreur lors de la réinitialisation du PIN" });
  }
};

/**
 * Demande un code OTP pour vérifier le téléphone
 * POST /api/users/phone/request
 */
export const requestPhoneVerification = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { body: { phone, method } } = requestPhoneVerificationSchema.parse(req) as { body: any };
    if (!phone) return res.status(400).json({ error: "Numéro de téléphone requis" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error } = await supabaseAdmin
      .from('phone_verifications')
      .insert({
        user_id: userId,
        phone,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    // Simulation d'envoi (On ne log que les 3 premiers chiffres par sécurité)
    logger.info(`[OTP ${method.toUpperCase()}] Pour ${phone}: ${otp.substring(0, 3)}***`);
    
    // Si method === 'whatsapp', on pourrait appeler une API WhatsApp ici
    
    res.json({ success: true, message: "Code envoyé" });
  } catch (err) {
    logger.error('Erreur requestPhoneVerification', err);
    res.status(500).json({ error: "Impossible d'envoyer le code" });
  }
};

/**
 * Vérifie le code OTP et certifie le téléphone
 * POST /api/users/phone/verify
 */
export const verifyPhone = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { body: { phone, code } } = verifyPhoneSchema.parse(req);
    const { data: verification, error } = await supabaseAdmin
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
    await supabaseAdmin
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    // Mettre à jour le profil utilisateur
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        phone_verified: true,
        phone: phone, // S'assurer que le numéro est celui vérifié
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    res.json({ success: true, message: "Téléphone vérifié avec succès" });
  } catch (err) {
    logger.error('Erreur verifyPhone', err);
    res.status(500).json({ error: "Erreur lors de la vérification" });
  }
};

