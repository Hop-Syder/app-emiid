"use strict";
/// <reference path="./types/express/index.d.ts" />
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Point d'entrée du serveur EmiID Backend
 * @created 2026-05-07
 * @updated 2026-06-02
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
require("./config/supabase"); // Force l'exécution immédiate du diagnostic de clé au boot
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 5000);
// Création explicite du serveur HTTP pour supporter les WebSockets sur le même port (requis pour Railway)
const server = http_1.default.createServer(app_1.app);
// Initialisation du serveur WebSocket
const wss = new ws_1.default.Server({ server });
wss.on('connection', (socket) => {
    logger_1.logger.info('Nouvelle connexion WebSocket établie');
    // Heartbeat pour éviter le timeout de 60s de Railway
    const pingInterval = setInterval(() => {
        if (socket.readyState === ws_1.default.OPEN) {
            socket.ping();
        }
    }, 30000);
    socket.on('close', () => {
        logger_1.logger.info('Connexion WebSocket fermée');
        clearInterval(pingInterval);
        socket.removeAllListeners();
    });
    socket.on('error', (error) => {
        logger_1.logger.error('Erreur WebSocket:', error);
    });
});
server.listen(PORT, '0.0.0.0', () => {
    logger_1.logger.info(`>>> DÉMARRAGE DU SERVEUR SUR LE PORT ${PORT} <<<`);
    logger_1.logger.info('Serveur demarre avec support WebSocket et Heartbeat');
    logger_1.logger.info(`URL locale: http://localhost:${PORT}`);
    logger_1.logger.info(`Port configure: ${process.env.PORT || 'non defini (usage du port 5000)'}`);
    logger_1.logger.info(`Origines CORS autorisees: ${app_1.allowedOrigins.join(', ')}`);
});
