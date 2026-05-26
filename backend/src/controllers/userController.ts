/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
*/

import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';
import { UserProfile } from '../types/models';

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
    const { data, error } = await supabase
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
  const { 
    first_name, last_name, bio, avatar_url,
    role, specialty, category, activity_domain,
    country_id, country_code, country_name, city,
    job_title, industry, pin_enabled, pin_code,
    phone, website, is_published, tags, card_variant, slug
  } = req.body;

  try {
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
    // On utilise 'activity_domain' ou 'industry' pour 'industries'
    const finalDomain = activity_domain || industry;
    if (finalDomain) {
      await supabaseAdmin.from('industries').upsert({ name: finalDomain }, { onConflict: 'name' });
    }

    // --- PIN SECURITY LOGIC ---
    // Construction sécurisée de l'objet updates pour éviter les erreurs de colonnes inexistantes
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

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(updates, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    
    // --- TAGS LOGIC ---
    if (tags && Array.isArray(tags)) {
        const profileId = data.id;
        // Supprimer les anciens tags
        await supabaseAdmin.from('profile_tags').delete().eq('profile_id', profileId);
        
        for (const tagName of tags) {
            const cleanTag = tagName.toLowerCase().trim();
            if (cleanTag) {
                // Upsert tag
                const { data: tagData } = await supabaseAdmin.from('tags').upsert({ name: cleanTag }, { onConflict: 'name' }).select('id').single();
                if (tagData) {
                    await supabaseAdmin.from('profile_tags').insert({ profile_id: profileId, tag_id: tagData.id });
                }
            }
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
  const {
    notification_preferences,
    app_preferences,
    security_preferences,
  } = req.body || {};

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
  const { pin } = req.body;

  try {
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
  const targetUserId = req.params.id as string;

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
 * Demande un code OTP pour vérifier le téléphone
 * POST /api/users/phone/request
 */
export const requestPhoneVerification = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { phone, method } = req.body; // method: 'whatsapp' | 'sms'

  if (!phone) return res.status(400).json({ error: "Numéro de téléphone requis" });

  try {
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
  const { phone, code } = req.body;

  try {
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

// Map de stockage temporaire en mémoire pour les codes de réinitialisation PIN
const pinResetCodes = new Map<string, { code: string; expiresAt: number }>();

/**
 * Demande un code de réinitialisation du code PIN (envoyé par email)
 * POST /api/users/forgot-pin/request
 */
export const requestPinReset = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });

  try {
    // 1. Récupérer l'email de l'utilisateur
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('email, first_name')
      .eq('user_id', userId)
      .single();

    if (error || !profile || !profile.email) {
      return res.status(400).json({ error: "Email utilisateur introuvable" });
    }

    // 2. Générer un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // 3. Sauvegarder en mémoire
    pinResetCodes.set(userId, { code, expiresAt });

    // 4. Envoyer l'email via mailService
    const { sendEmail } = require('../services/mailService');
    const subject = "🔑 Réinitialisation de votre Code PIN EmiID";
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #022753; margin-bottom: 20px;">EmiID</h2>
        <p>Bonjour ${profile.first_name || 'membre EmiID'},</p>
        <p>Vous avez demandé la réinitialisation de votre code PIN de sécurité EmiID.</p>
        <p>Voici votre code de validation temporaire (valide pendant 15 minutes) :</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #FF4F01;">${code}</span>
        </div>
        <p>Saisissez ce code sur votre écran de vérification pour débloquer votre accès et réinitialiser votre code PIN.</p>
        <p style="color: #64748b; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          © 2026 Nexus Partners · Ton réseau, ta force.
        </p>
      </div>
    `;

    await sendEmail({ to: profile.email, subject, html });
    logger.info(`Code de réinitialisation PIN envoyé à ${profile.email}`);

    return res.json({ success: true, message: "Code envoyé par email" });
  } catch (err) {
    logger.error('Erreur requestPinReset', err);
    return res.status(500).json({ error: "Erreur lors de l'envoi du code de réinitialisation" });
  }
};

/**
 * Vérifie le code de réinitialisation et désactive le PIN
 * POST /api/users/forgot-pin/verify
 */
export const verifyPinResetCode = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });
  const { code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(400).json({ error: "Code de validation invalide" });
  }

  const storedData = pinResetCodes.get(userId);

  if (!storedData) {
    return res.status(400).json({ error: "Aucun code en cours. Veuillez refaire une demande." });
  }

  if (Date.now() > storedData.expiresAt) {
    pinResetCodes.delete(userId);
    return res.status(400).json({ error: "Code expiré. Veuillez refaire une demande." });
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: "Code incorrect" });
  }

  try {
    // Code correct ! On désactive le PIN, réinitialise les tentatives et débloque le compte
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        pin_enabled: false,
        pin_code: null,
        pin_attempts: 0,
        is_locked: false,
        locked_at: null
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Supprimer le code utilisé
    pinResetCodes.delete(userId);
    logger.info(`Code PIN désactivé avec succès suite à une réinitialisation pour ${userId}`);

    return res.json({ success: true, message: "Code PIN réinitialisé et désactivé avec succès" });
  } catch (err) {
    logger.error('Erreur verifyPinResetCode', err);
    return res.status(500).json({ error: "Erreur lors de la réinitialisation du code PIN" });
  }
};
