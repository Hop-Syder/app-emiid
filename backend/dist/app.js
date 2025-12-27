"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Point d'entrée du Backend API (Express + TypeScript)
 * @created 2025-12-27
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
// Initialize Environment
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use((0, helmet_1.default)()); // Security Headers
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' })); // CORS
app.use(express_1.default.json()); // JSON Body Parser
// Health Check (Public)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'Nexus Connect Backend',
        version: '1.0.0'
    });
});
// Protected Route Example
app.get('/api/protected', authMiddleware_1.requireAuth, (req, res) => {
    const user = req.user;
    res.json({
        message: 'Vous avez accédé à une route protégée !',
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`
  🚀 Nexus Connect Backend démarré !
  🔊 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});
exports.default = app;
