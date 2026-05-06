/// <reference path="./types/express/index.d.ts" />
import dotenv from 'dotenv'
import { app, allowedOrigins } from './app'
import { logger } from './utils/logger'

dotenv.config()

const PORT = Number(process.env.PORT || 5000)

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`>>> DÉMARRAGE DU SERVEUR SUR LE PORT ${PORT} <<<`)
  logger.info('Serveur demarre')
  logger.info(`URL locale: http://localhost:${PORT}`)
  logger.info(`Port configure: ${process.env.PORT || 'non defini (usage du port 5000)'}`)
  logger.info(`Origines CORS autorisees: ${allowedOrigins.join(', ')}`)
})
