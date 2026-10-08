/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
 * @updated 2026-06-03
 */

import { Request, Response } from 'express';
import { randomInt } from 'crypto';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';
import { hasRecentTotp, type AuthClaims } from '../utils/mfa';
import { UserProfile } from '../types/models';
import { sendEmail } from '../services/mailService';
import { sendSms } from '../services/smsService';
import {
  updateProfileSchema,
  updateSettingsSchema,
  verifyPinSchema,
  resetPinSchema,
  setPinSchema,
  disablePinSchema,
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
/**
 * Vérifie la disponibilité réelle d'un slug (même requête que updateMyProfile)
 * GET /api/users/check-slug?slug=...
 */
export const checkSlugAvailability = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  const slug = String(req.query.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!slug) return res.status(400).json({ error: "Slug requis" });

  try {
    const { data: existingSlugProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('slug', slug)
      .neq('user_id', userId)
      .maybeSingle();

    res.json({ available: !existingSlugProfile });
  } catch (err) {
    logger.error('Erreur checkSlugAvailability', err);
    res.status(500).json({ error: "Impossible de vérifier la disponibilité du slug" });
  }
};

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
        // Reshape DTO : on aplatit la jointure profile_tags(tags(name)) en data.tags
        const profileData = data as Omit<typeof data, 'profile_tags'> & { tags?: string[]; profile_tags?: unknown };
        profileData.tags = data.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
        delete profileData.profile_tags;
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
    const parsed = updateProfileSchema.safeParse(req);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(400).json({ error: issue?.message || 'Données de profil invalides', field: issue?.path.slice(1).join('.') });
    }
    const body = parsed.data.body as any;
    const {
      first_name, last_name, business_name, bio, avatar_url,
      role, specialty, category, activity_domain,
      country_id, country_code, country_name, city, district, commune_id,
      job_title, industry,
      phone, website, is_published, tags, card_variant, slug,
      show_contact, latitude, longitude, is_nomad,
      // Paramètres avancés (onglets À propos / Réseaux / Horaires & Services)
      slogan, years_experience, facebook_url, instagram_url, tiktok_url,
      linkedin_url, secondary_phone, public_email, address,
      opening_hours, services, experiences
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

    // Les champs absents du corps restent `undefined` et ne sont pas envoyés :
    // une sauvegarde partielle (champs modifiés uniquement) n'écrase rien.
    const updates: any = {
        user_id: userId,
        first_name,
        last_name,
        business_name,
        bio,
        avatar_url,
        role: finalRole,
        specialty,
        category,
        activity_domain: finalDomain,
        country_id: finalCountryId,
        city: city !== undefined ? city : undefined,
        district: district !== undefined ? district : undefined,
        // Choisi explicitement dans les paramètres depuis le 06/09. La
        // migration 20260824 ne l'avait rattaché qu'une fois, par
        // correspondance de nom sur `city` : tout profil créé ensuite restait
        // sans commune, donc invisible dans « Talents de votre commune » et
        // hors de portée des mises en avant communales.
        commune_id: commune_id !== undefined ? commune_id : undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
        is_nomad: is_nomad !== undefined ? is_nomad : undefined,
        job_title: finalRole,
        phone,
        website,
        is_published,
        card_variant,
        has_profile: true,
        // Paramètres avancés
        slogan,
        years_experience,
        facebook_url,
        instagram_url,
        tiktok_url,
        linkedin_url,
        secondary_phone,
        public_email,
        address,
        opening_hours,
        services,
        experiences,
        updated_at: new Date().toISOString()
    };
    
    // On ne touche au slug QUE s'il est explicitement fourni dans la requête.
    // (Une sauvegarde partielle — ex. onglets Paramètres — n'envoie pas de slug
    //  et ne doit donc pas écraser le lien personnalisé existant.)
    // Une chaîne vide reste autorisée pour effacer volontairement le slug.
    if (slug !== undefined) {
      updates.slug = finalSlug;
    }

    // SÉCURITÉ : le PIN n'est JAMAIS modifiable par cette route (qui ne demande
    // aucune preuve d'identité). Voir POST /api/users/pin et /api/users/pin/disable.

    // R7 — visibilité du contact (opt-in) : uniquement si le champ est fourni.
    if (show_contact !== undefined) updates.show_contact = show_contact;

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
            
            // Normaliser + dédupliquer.
            const cleanTags = Array.from(new Set(
                (tags as string[]).map((t) => t.toLowerCase().trim()).filter(Boolean)
            ));

            if (cleanTags.length > 0) {
                // Upsert BATCH : une seule requête. ON CONFLICT(name) gère la concurrence
                // au niveau BDD (fini la boucle N+1 select-then-insert + retry 23505).
                const { data: tagRows, error: upsertError } = await supabaseAdmin
                    .from('tags')
                    .upsert(cleanTags.map((name) => ({ name })), { onConflict: 'name' })
                    .select('id');

                if (upsertError) {
                    logger.error('Erreur lors de l\'upsert batch des tags:', upsertError);
                } else if (tagRows && tagRows.length > 0) {
                    // Liaison BATCH profile_tags (une seule requête).
                    const { error: linkError } = await supabaseAdmin
                        .from('profile_tags')
                        .insert(tagRows.map((t) => ({ profile_id: profileId, tag_id: t.id })));

                    if (linkError) {
                        logger.error(`Erreur lors de la liaison batch des tags au profil (ID: ${profileId}):`, linkError);
                    }
                }
            }
        } catch (tagsCatchErr) {
            logger.error('Exception capturée durant la sauvegarde des tags du profil:', tagsCatchErr);
        }
    }

    // Récupérer le profil complet mis à jour pour le renvoyer de manière cohérente avec le GET
    try {
      const { data: updatedProfile, error: refetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('*, countries(name, iso_code), profile_tags(tags(name))')
        .eq('user_id', userId)
        .single();

      if (!refetchError && updatedProfile) {
        // Reshape DTO : on aplatit la jointure profile_tags(tags(name)) en tags
        const profileData = updatedProfile as Omit<typeof updatedProfile, 'profile_tags'> & { tags?: string[]; profile_tags?: unknown };
        profileData.tags = updatedProfile.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
        delete profileData.profile_tags;
        
        // Compléter avec les données d'authentification fallback
        const authFallback = {
          first_name: req.user.user_metadata?.first_name || req.user.user_metadata?.given_name || null,
          last_name: req.user.user_metadata?.last_name || req.user.user_metadata?.family_name || null,
          email: req.user.email || null,
          phone: req.user.phone || null,
          avatar_url: req.user.user_metadata?.avatar_url || null,
        };

        updatedProfile.first_name = updatedProfile.first_name || authFallback.first_name;
        updatedProfile.last_name = updatedProfile.last_name || authFallback.last_name;
        updatedProfile.email = updatedProfile.email || authFallback.email;
        updatedProfile.phone = updatedProfile.phone || authFallback.phone;
        updatedProfile.avatar_url = updatedProfile.avatar_url || authFallback.avatar_url;
        
        Object.assign(updatedProfile, buildUserSettings(req.user, !!updatedProfile.is_published));
        
        return res.json(updatedProfile);
      }
      
      if (refetchError) {
        logger.error('Erreur lors du refetch complet du profil mis à jour:', refetchError);
      }
    } catch (refetchErr) {
      logger.error('Exception lors du refetch du profil mis à jour:', refetchErr);
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

    // Sync notification_preferences table (used by useNotificationPreferences hook)
    // Mapping: UI fields → table columns
    const mergedNotifPrefs = mergedMetadata.notification_preferences;
    const { error: notifSyncError } = await supabaseAdmin
      .from('notification_preferences')
      .upsert(
        {
          user_id:          userId,
          notify_messages:  mergedNotifPrefs.messages         ?? true,
          notify_followers: mergedNotifPrefs.network_activity ?? true,
          notify_views:     mergedNotifPrefs.network_activity ?? true,
          email_enabled:    mergedNotifPrefs.newsletter       ?? false,
          push_enabled:     mergedNotifPrefs.push             ?? true,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (notifSyncError) {
      logger.warn('Sync notification_preferences table failed (non-blocking)', notifSyncError);
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
const PIN_LOCK_DELAYS = [0, 0, 0, 1, 5, 15, 60, 1440]; // minutes, index = tentatives

type PinCheck =
  | { ok: true; pinEnabled: boolean }
  | { ok: false; status: number; body: Record<string, unknown> };

/**
 * Vérifie un PIN en appliquant le compteur d'essais et le blocage exponentiel
 * (1 min, 5 min, 15 min, 1 h, 24 h). Partagé par la vérification simple et par
 * les actions sensibles (changer / désactiver le PIN).
 */
async function checkPin(userId: string, pin: string): Promise<PinCheck> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('pin_code, pin_attempts, pin_enabled, is_locked, locked_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) return { ok: false, status: 400, body: { error: "Profil introuvable" } };
  const profile = data as UserProfile;

  if (!profile.pin_enabled || !profile.pin_code) return { ok: true, pinEnabled: false };

  if (profile.is_locked && profile.locked_at) {
    const attempts = profile.pin_attempts || 3;
    const delayMinutes = attempts < PIN_LOCK_DELAYS.length ? PIN_LOCK_DELAYS[attempts] : 1440;
    const diffMinutes = (Date.now() - new Date(profile.locked_at).getTime()) / 60000;

    if (diffMinutes < delayMinutes) {
      const remainingMinutes = Math.ceil(delayMinutes - diffMinutes);
      return {
        ok: false,
        status: 403,
        body: {
          error: `Compte temporairement bloqué. Veuillez réessayer dans ${remainingMinutes} minute(s).`,
          is_locked: true,
          remaining_minutes: remainingMinutes,
        },
      };
    }
    // Délai écoulé : une nouvelle tentative est permise.
  }

  if (await bcrypt.compare(pin, profile.pin_code)) {
    await supabaseAdmin
      .from('user_profiles')
      .update({ pin_attempts: 0, is_locked: false, locked_at: null })
      .eq('user_id', userId);
    return { ok: true, pinEnabled: true };
  }

  const newAttempts = (profile.pin_attempts || 0) + 1;
  const shouldLock = newAttempts >= 3;
  await supabaseAdmin
    .from('user_profiles')
    .update({
      pin_attempts: newAttempts,
      ...(shouldLock ? { is_locked: true, locked_at: new Date().toISOString() } : {}),
    })
    .eq('user_id', userId);

  if (shouldLock) {
    const delayMinutes = newAttempts < PIN_LOCK_DELAYS.length ? PIN_LOCK_DELAYS[newAttempts] : 1440;
    return {
      ok: false,
      status: 403,
      body: {
        error: `Code PIN incorrect. Compte bloqué pour ${delayMinutes} minute(s).`,
        attempts_remaining: 0,
        is_locked: true,
        next_retry_in: delayMinutes,
      },
    };
  }

  return { ok: false, status: 401, body: { error: "Code PIN incorrect", attempts_remaining: 3 - newAttempts } };
}

/**
 * Vérifie que l'appelant peut toucher à un PIN déjà actif : soit il fournit
 * l'ancien PIN, soit il vient de valider un code TOTP (Google / Microsoft
 * Authenticator) dans les 5 dernières minutes.
 * Renvoie null si la preuve est valide, sinon la réponse d'erreur à envoyer.
 */
async function requirePinProof(
  userId: string,
  claims: AuthClaims,
  currentPin: string | undefined,
): Promise<{ status: number; body: Record<string, unknown> } | null> {
  if (currentPin) {
    const result = await checkPin(userId, currentPin);
    return result.ok ? null : { status: result.status, body: result.body };
  }
  if (hasRecentTotp(claims)) return null;
  return {
    status: 403,
    body: {
      error: 'PIN_PROOF_REQUIRED',
      message: "Saisissez votre code PIN actuel ou un code de votre application d'authentification.",
    },
  };
}

export const verifyPin = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  try {
    const { body: { pin } } = verifyPinSchema.parse(req);
    const result = await checkPin(userId, pin);
    if (!result.ok) return res.status(result.status).json(result.body);
    return res.json(result.pinEnabled ? { success: true } : { success: true, message: "PIN non activé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification du PIN" });
  }
};

/**
 * Crée ou change le code PIN.
 * POST /api/users/pin  { new_pin, current_pin? }
 * Si un PIN existe déjà : ancien PIN OU code TOTP récent obligatoire.
 */
export const setMyPin = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const parsed = setPinSchema.safeParse(req);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Requête invalide' });
    const { new_pin, current_pin } = parsed.data.body;

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('pin_enabled, pin_code')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile?.pin_enabled && profile?.pin_code) {
      const denied = await requirePinProof(userId, req.authClaims || {}, current_pin);
      if (denied) return res.status(denied.status).json(denied.body);
    }

    const pinHash = await bcrypt.hash(new_pin, await bcrypt.genSalt(10));
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        pin_enabled: true,
        pin_code: pinHash,
        pin_attempts: 0,
        is_locked: false,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) return res.status(400).json({ error: "Impossible d'enregistrer le code PIN" });
    return res.json({ success: true, pin_enabled: true });
  } catch (err) {
    logger.error('Erreur setMyPin', err);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement du PIN" });
  }
};

/**
 * Désactive le code PIN.
 * POST /api/users/pin/disable  { current_pin? }
 * Même preuve que pour le changer : ancien PIN OU code TOTP récent.
 */
export const disableMyPin = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const parsed = disablePinSchema.safeParse(req);
    if (!parsed.success) return res.status(400).json({ error: 'Requête invalide' });

    const denied = await requirePinProof(userId, req.authClaims || {}, parsed.data.body.current_pin);
    if (denied) return res.status(denied.status).json(denied.body);

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ pin_enabled: false, pin_code: null, pin_attempts: 0, is_locked: false, locked_at: null })
      .eq('user_id', userId);

    if (error) return res.status(400).json({ error: "Impossible de désactiver le PIN" });
    return res.json({ success: true, pin_enabled: false });
  } catch (err) {
    logger.error('Erreur disableMyPin', err);
    return res.status(500).json({ error: "Erreur lors de la désactivation du PIN" });
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
 * Demande un OTP par email pour réinitialiser le code PIN
 * POST /api/users/pin/request-reset
 */
export const requestPinReset = async (req: any, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;
  if (!userId || !email) return res.status(401).json({ error: "Non authentifié" });

  try {
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error } = await supabaseAdmin
      .from('pin_reset_verifications')
      .insert({
        user_id: userId,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    await sendEmail({
      to: email,
      subject: "Code de réinitialisation de votre code PIN EmiID",
      html: `<p>Voici votre code de vérification pour réinitialiser votre code PIN&nbsp;: <strong>${otp}</strong></p><p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
      text: `Votre code de vérification EmiID : ${otp} (expire dans 10 minutes).`
    });

    res.json({ success: true, message: "Code envoyé par e-mail" });
  } catch (err) {
    logger.error('Erreur requestPinReset', err);
    res.status(500).json({ error: "Impossible d'envoyer le code" });
  }
};

/**
 * Vérifie l'OTP email et définit un nouveau code PIN
 * POST /api/users/reset-pin
 */
export const resetMyPin = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  try {
    const { body: { otp, newPin } } = resetPinSchema.parse(req);

    const { data: verification, error: verifError } = await supabaseAdmin
      .from('pin_reset_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verifError || !verification) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    await supabaseAdmin
      .from('pin_reset_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(newPin, salt);

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        pin_enabled: true,
        pin_code: hashedPin,
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
    return res.json({ success: true, message: "Nouveau code PIN défini avec succès" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Code OTP et nouveau PIN requis" });
    }
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

    // SÉCURITÉ : générateur cryptographique — Math.random() est prédictible
    // et inadapté à un code de vérification.
    const otp = randomInt(100000, 1000000).toString();
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

    const smsResult = await sendSms(phone, `Votre code de vérification EmiID : ${otp}`);
    if (!smsResult.success) {
      // Honnête : aucun fournisseur SMS/WhatsApp n'est branché, ne pas prétendre
      // que le code a été livré (cf. NoopSmsProvider dans services/smsService.ts).
      return res.status(503).json({ error: "Envoi du code impossible pour le moment. Réessayez plus tard." });
    }

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


// ---------------------------------------------------------------------------
// VÉRIFICATION D'IDENTITÉ (KYC)
// Les fichiers sont téléversés côté client dans le bucket privé "verification"
// (chemin `${uid}/…`, RLS propriétaire). Ici on n'enregistre que la référence.
// ---------------------------------------------------------------------------
const VERIFICATION_DOC_TYPES = ['cni', 'cip', 'passeport', 'ifu', 'registre', 'atelier'] as const;

export const getMyVerificationDocs = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('verification_documents')
      .select('id, doc_type, file_path, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    logger.error('Erreur getMyVerificationDocs', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
};

export const addMyVerificationDoc = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { doc_type, file_path } = req.body || {};

  if (!doc_type || !VERIFICATION_DOC_TYPES.includes(doc_type)) {
    return res.status(400).json({ error: 'Type de document invalide' });
  }
  if (!file_path || typeof file_path !== 'string') {
    return res.status(400).json({ error: 'Référence de fichier manquante' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('verification_documents')
      .insert({ user_id: userId, doc_type, file_path, status: 'pending' })
      .select('id, doc_type, file_path, status, created_at')
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    logger.error('Erreur addMyVerificationDoc', err);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement du document" });
  }
};
