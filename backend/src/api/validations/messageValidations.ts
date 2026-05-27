import { z } from 'zod';

export const replyMediationSchema = z.object({
  body: z.object({
    message: z.string({
      message: "Le message est requis",
    }).min(1, "Le message ne peut pas être vide"),
  }),
});

export const updateMediationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'resolved', 'closed', 'active'] as const, {
      message: "Le statut est requis",
    }),
  }),
});

export const requestMediationSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }).passthrough(),
});
