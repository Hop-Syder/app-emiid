import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({
      message: "L'email est requis",
    }).email("Format d'email invalide"),
    password: z.string({
      message: "Le mot de passe est requis",
    }).min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  }).passthrough(),
});
