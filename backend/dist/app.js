"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.allowedOrigins = void 0;
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./api/routes/auth"));
const userRoutes_1 = __importDefault(require("./api/routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./api/routes/messageRoutes"));
const dashboardRoutes_1 = __importDefault(require("./api/routes/dashboardRoutes"));
const publicRoutes_1 = __importDefault(require("./api/routes/publicRoutes"));
const webhookRoutes_1 = __importDefault(require("./api/routes/webhookRoutes"));
const referenceRoutes_1 = __importDefault(require("./api/routes/referenceRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const logger_1 = require("./utils/logger");
const supabase_1 = require("./config/supabase");
dotenv_1.default.config();
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://app.emiid.com',
    'https://www.app.emiid.com',
];
exports.allowedOrigins = (() => {
    const configuredOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
    return configuredOrigins
        ? configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
        : defaultOrigins;
})();
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (exports.allowedOrigins.includes(origin) || exports.allowedOrigins.includes('*')) {
                return callback(null, true);
            }
            logger_1.logger.warn(`Origine bloquee par CORS: ${origin}`);
            return callback(new Error('CORS_FORBIDDEN'));
        },
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.get('/', (_req, res) => {
        res.status(200).json({
            message: "EmiID Backend est opérationnel !",
            status: 'ok',
            port: Number(process.env.PORT || 5000),
        });
    });
    app.get('/health', async (_req, res) => {
        try {
            const start = Date.now();
            const { error, count } = await supabase_1.supabaseAdmin
                .from('countries')
                .select('id', { count: 'exact', head: true });
            if (error) {
                return res.status(503).json({
                    status: 'degraded',
                    checks: {
                        database: {
                            status: 'down',
                            message: error.message,
                        },
                    },
                });
            }
            return res.status(200).json({
                status: 'ok',
                uptime_seconds: Math.round(process.uptime()),
                checks: {
                    database: {
                        status: 'up',
                        response_time_ms: Date.now() - start,
                        countries_count: count ?? null,
                    },
                },
            });
        }
        catch (error) {
            return res.status(503).json({
                status: 'degraded',
                checks: {
                    database: {
                        status: 'down',
                        message: error instanceof Error ? error.message : 'Erreur inconnue',
                    },
                },
            });
        }
    });
    app.use('/api/auth', auth_1.default);
    app.use('/api/users', userRoutes_1.default);
    app.use('/api/messages', messageRoutes_1.default);
    app.use('/api/dashboard-user', dashboardRoutes_1.default);
    app.use('/api/public', publicRoutes_1.default);
    app.use('/api/webhooks', webhookRoutes_1.default);
    app.use('/api/reference', referenceRoutes_1.default);
    app.use(errorMiddleware_1.errorHandler);
    return app;
}
exports.app = createApp();
