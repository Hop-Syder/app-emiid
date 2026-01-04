"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./api/routes/auth"));
const userRoutes_1 = __importDefault(require("./api/routes/userRoutes"));
const adsRoutes_1 = __importDefault(require("./api/routes/adsRoutes"));
const dashboardRoutes_1 = __importDefault(require("./api/routes/dashboardRoutes"));
// Charger les variables d'environnement
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Autorise les requêtes sans origine (comme Postman ou les outils serveurs)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json()); // Pour parser le JSON des requêtes
// Route de santé pour vérifier que le serveur est en ligne
app.get('/', (req, res) => {
    res.status(200).json({ message: "Nexus Connect Backend est opérationnel !" });
});
// Routes de l'API
app.use('/api/auth', auth_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/ads', adsRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré !`);
    console.log(`📡 URL Locale : http://localhost:${PORT}`);
    console.log(`☁️  Port configuré (Railway) : ${process.env.PORT || 'non défini (usage du port 5000)'}`);
});
