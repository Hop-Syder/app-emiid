/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Code de base (Boilerplate) pour Nukun
 * @created 2026-03-24
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

# 🧱 Code de Base & Initialisation - Nukun

Ce document présente les extraits de code fondamentaux pour initialiser et faire fonctionner l'écosystème Nukun.

## 1. Initialisation de l'API Express (Backend)

```typescript
// backend/src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './api/routes/userRoutes';

dotenv.config();

const app: Application = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Routes principales
app.use('/api/users', userRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nukun Backend prêt sur le port ${PORT}`);
});
```

---

## 2. Client Supabase (Frontend-User)

```typescript
// frontend-user/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 3. Middleware d'Authentification (Backend)

```typescript
// backend/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Non autorisé' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return res.status(401).json({ error: 'Token invalide' });

  req.user = user; // Injection de l'utilisateur dans l'objet de requête
  next();
};
```

---

## 4. Composant Core : Card de Profil (Design System)

```tsx
// design-system/src/components/profile-card.tsx
import { motion } from 'framer-motion';

interface ProfileProps {
  name: string;
  role: string;
  avatar: string;
}

export const ProfileCard = ({ name, role, avatar }: ProfileProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
    >
      <img src={avatar} alt={name} className="w-16 h-16 rounded-full mb-3 shadow-lg" />
      <h3 className="text-lg font-bold text-white">{name}</h3>
      <p className="text-sm text-gray-400">{role}</p>
    </motion.div>
  );
};
```

---

## 5. Script d'Initialisation (Package.json racine)

```json
{
  "name": "nukun-monorepo",
  "scripts": {
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" \"npm run dev:admin\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend-user && npm run dev",
    "dev:admin": "cd admin && npm run dev",
    "install:all": "npm install && cd backend && npm install && cd ../frontend-user && npm install && cd ../admin && npm install"
  }
}
```
