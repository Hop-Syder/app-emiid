import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/userRoutes';
import adsRoutes from './api/routes/adsRoutes';

// Charger les variables d'environnement
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Correspond à l'URL du Frontend
  credentials: true // Autorise l'envoi de cookies/headers d'authentification
}));
app.use(express.json()); // Pour parser le JSON des requêtes

// Route de santé pour vérifier que le serveur est en ligne
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "Nexus Connect Backend est opérationnel !" });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});