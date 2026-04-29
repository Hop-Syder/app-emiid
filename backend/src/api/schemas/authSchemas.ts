import { z } from 'zod'

const RESERVED_ROLE_PATTERN = /\b(admin|administrator|administrateur|superadmin|root|moderator|modérateur)\b/i

export const registerUserSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8)
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Mot de passe trop faible'),
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  role: z
    .string()
    .trim()
    .max(100)
    .refine((v) => !RESERVED_ROLE_PATTERN.test(v), 'Rôle réservé non autorisé à l’inscription')
    .optional(),
})

