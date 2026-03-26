"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 5000);
app_1.app.listen(PORT, '0.0.0.0', () => {
    logger_1.logger.info('Serveur demarre');
    logger_1.logger.info(`URL locale: http://localhost:${PORT}`);
    logger_1.logger.info(`Port configure: ${process.env.PORT || 'non defini (usage du port 5000)'}`);
    logger_1.logger.info(`Origines CORS autorisees: ${app_1.allowedOrigins.join(', ')}`);
});
