import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères").optional(),
    lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères").optional(),
  }).passthrough(),
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
