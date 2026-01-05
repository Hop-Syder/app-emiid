import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/userRoutes';
import adsRoutes from './api/routes/adsRoutes';
import dashboardRoutes from './api/routes/dashboardRoutes';
import referenceRoutes from './api/routes/referenceRoutes';

// Charger les variables d'environnement
dotenv.config();

const app: Application = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origine (comme Postman ou les outils serveurs)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reference', referenceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré !`);
  console.log(`📡 URL Locale : http://localhost:${PORT}`);
  console.log(`☁️  Port configuré (Railway) : ${process.env.PORT || 'non défini (usage du port 5000)'}`);
});