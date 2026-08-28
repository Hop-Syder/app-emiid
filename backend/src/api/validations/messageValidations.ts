/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schémas de validation Zod pour la messagerie EmiID
 * @created 2026-01-25
 * @updated 2026-05-27
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
import { z } from 'zod';

// ─── Schémas de médiation ─────────────────────────────────────────────────────

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

// ─── Schémas de messagerie (texte / emoji / image) ────────────────────────────

export const MESSAGE_TYPES = ['text', 'emoji', 'image'] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

/** Envoi d'un message texte ou emoji */
export const sendMessageSchema = z.object({
  body: z.object({
    conversation_id: z.string().uuid("L'identifiant de conversation est invalide"),
    content: z.string().min(1, "Le contenu du message ne peut pas être vide").max(2000, "Message trop long (max 2000 caractères)"),
    message_type: z.enum(['text', 'emoji'] as const).default('text'),
  }),
});

/** Envoi d'un message image (après upload Storage) */
export const sendImageMessageSchema = z.object({
  body: z.object({
    conversation_id: z.string().uuid("L'identifiant de conversation est invalide"),
    media_url: z.string().url("L'URL de l'image est invalide"),
    content: z.string().max(500, "La légende est trop longue (max 500 caractères)").optional(),
  }),
});

/** Upload d'une image vers le bucket Storage messages */
export const imageUploadSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid("L'identifiant de conversation est invalide"),
  }),
});

// Types inférés
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type SendImageMessageInput = z.infer<typeof sendImageMessageSchema>['body'];
