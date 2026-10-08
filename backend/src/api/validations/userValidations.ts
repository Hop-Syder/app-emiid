import { z } from 'zod';

// Vide toléré : un jour fermé peut ne pas porter d'heures.
const HHMM = /^(([01]\d|2[0-3]):[0-5]\d)?$/;

/** Créneau d'ouverture d'un jour (JSONB `opening_hours`). */
const openingHourSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string().regex(HHMM, "Heure d'ouverture invalide (HH:MM)"),
  close: z.string().regex(HHMM, "Heure de fermeture invalide (HH:MM)"),
  closed: z.boolean(),
});

/** Prestation du catalogue (JSONB `services`), prix en FCFA. */
const serviceSchema = z.object({
  title: z.string().max(120),
  price: z.number().nonnegative().max(1_000_000_000).nullable(),
  description: z.string().max(500),
});

/** Étape du parcours (JSONB `experiences`). */
const experienceSchema = z.object({
  id: z.string().max(64),
  title: z.string().max(150),
  company: z.string().max(150).optional().default(''),
  startDate: z.string().max(20).optional().default(''),
  endDate: z.string().max(20).nullable().optional(),
  current: z.boolean().optional().default(false),
  description: z.string().max(1000).optional().default(''),
}).passthrough();

/**
 * Mise à jour (partielle) du profil. Les champs JSONB et les champs bornés en
 * base sont typés ici : un format invalide est refusé (400) avant d'atteindre
 * PostgreSQL. Les autres champs restent filtrés par le contrôleur (liste blanche).
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères").optional(),
    lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères").optional(),
    slogan: z.string().max(160, "Le slogan ne doit pas dépasser 160 caractères").optional(),
    bio: z.string().max(1200, "La bio ne doit pas dépasser 1200 caractères").optional(),
    years_experience: z.number().int().min(0).max(80).nullable().optional(),
    tags: z.array(z.string().max(50)).max(8, "8 mots-clés maximum").optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    opening_hours: z.array(openingHourSchema).max(7).optional(),
    services: z.array(serviceSchema).max(50).optional(),
    experiences: z.array(experienceSchema).max(50).optional(),
  }).passthrough().superRefine((body, ctx) => {
    // Cohérence temporelle : un jour ouvert ferme après avoir ouvert.
    body.opening_hours?.forEach((h, i) => {
      if (!h.closed && (!h.open || !h.close || h.open >= h.close)) {
        ctx.addIssue({ code: 'custom', path: ['opening_hours', i], message: "L'heure de fermeture doit être après l'heure d'ouverture" });
      }
    });
    // Un poste ne se termine pas avant d'avoir commencé (format YYYY-MM, comparable tel quel).
    body.experiences?.forEach((e, i) => {
      if (!e.current && e.startDate && e.endDate && e.startDate > e.endDate) {
        ctx.addIssue({ code: 'custom', path: ['experiences', i], message: "La date de fin d'une expérience doit suivre sa date de début" });
      }
    });
  }),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    notifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).passthrough(),
});

export const verifyPinSchema = z.object({
  body: z.object({
    pin: z.string({
      message: "Le code PIN est requis",
    }).min(4).max(6),
  }),
});

/** Définir / changer le PIN : preuve = ancien PIN, ou code TOTP saisi récemment. */
export const setPinSchema = z.object({
  body: z.object({
    new_pin: z.string().regex(/^\d{6}$/, "Le code PIN doit contenir 6 chiffres"),
    current_pin: z.string().regex(/^\d{6}$/).optional(),
  }),
});

/** Désactiver le PIN : même preuve que pour le changer. */
export const disablePinSchema = z.object({
  body: z.object({
    current_pin: z.string().regex(/^\d{6}$/).optional(),
  }),
});

export const resetPinSchema = z.object({
  body: z.object({
    otp: z.string({
      message: "Le code OTP est requis",
    }),
    newPin: z.string({
      message: "Le nouveau PIN est requis",
    }).min(4).max(6),
  }),
});

export const requestPhoneVerificationSchema = z.object({
  body: z.object({
    phone: z.string({
      message: "Le numéro de téléphone est requis",
    }).min(6),
  }),
});

export const verifyPhoneSchema = z.object({
  body: z.object({
    phone: z.string({
      message: "Le numéro de téléphone est requis",
    }),
    code: z.string({
      message: "Le code de vérification est requis",
    }).min(4),
  }),
});

export const updateFollowNoteSchema = z.object({
  body: z.object({
    note: z.string().max(500, "La note ne doit pas dépasser 500 caractères").optional(),
  }).passthrough(),
});
