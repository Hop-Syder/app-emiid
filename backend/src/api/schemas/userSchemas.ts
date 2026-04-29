import { z } from 'zod'

const RESERVED_ROLE_PATTERN = /\b(admin|administrator|administrateur|superadmin|root|moderator|modérateur)\b/i

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
})

export const requestPhoneVerificationSchema = z.object({
  phone: z.string().trim().regex(/^\+?[0-9\s().-]{8,20}$/),
  method: z.enum(['whatsapp', 'sms']).optional(),
})

export const verifyPhoneSchema = z.object({
  phone: z.string().trim().regex(/^\+?[0-9\s().-]{8,20}$/),
  code: z.string().regex(/^\d{6}$/),
})

export const updateMyProfileSchema = z.object({
  first_name: z.string().trim().max(100).nullable().optional(),
  last_name: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  avatar_url: z.string().trim().max(2048).nullable().optional(),
  role: z
    .string()
    .trim()
    .max(100)
    .refine((v) => !RESERVED_ROLE_PATTERN.test(v), 'Rôle réservé')
    .nullable()
    .optional(),
  specialty: z.string().trim().max(255).nullable().optional(),
  category: z.string().trim().max(50).nullable().optional(),
  activity_domain: z.string().trim().max(100).nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  country_code: z.string().trim().length(2).nullable().optional(),
  country_name: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  job_title: z.string().trim().max(100).nullable().optional(),
  industry: z.string().trim().max(100).nullable().optional(),
  pin_enabled: z.boolean().optional(),
  pin_code: z.string().regex(/^\d{6}$/).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  website: z.string().trim().max(2048).nullable().optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  card_variant: z.string().trim().max(50).nullable().optional(),
  slug: z.string().trim().max(80).nullable().optional(),
})

