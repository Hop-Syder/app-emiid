/// <reference path="./types/express/index.d.ts" />
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Point d'entrée du serveur EmiID Backend
 * @created 2026-05-07
 * @updated 2026-06-02
 */

import dotenv from 'dotenv'
import http from 'http'
import ws from 'ws'
import './config/supabase' // Force l'exécution immédiate du diagnostic de clé au boot
import { app, allowedOrigins } from './app'
import { logger } from './utils/logger'

dotenv.config()

const PORT = Number(process.env.PORT || 5000)

// Création explicite du serveur HTTP pour supporter les WebSockets sur le même port (requis pour Render)
const server = http.createServer(app)

// Initialisation du serveur WebSocket
const wss = new ws.Server({ server })

wss.on('connection', (socket) => {
  logger.info('Nouvelle connexion WebSocket établie')
  
  // Heartbeat pour éviter le timeout d'inactivité du proxy Render
  const pingInterval = setInterval(() => {
    if (socket.readyState === ws.OPEN) {
      socket.ping()
    }
  }, 30000)

  socket.on('close', () => {
    logger.info('Connexion WebSocket fermée')
    clearInterval(pingInterval)
    socket.removeAllListeners()
  })

  socket.on('error', (error) => {
    logger.error('Erreur WebSocket:', error)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`>>> DÉMARRAGE DU SERVEUR SUR LE PORT ${PORT} <<<`)
  logger.info('Serveur demarre avec support WebSocket et Heartbeat')
  logger.info(`URL locale: http://localhost:${PORT}`)
  logger.info(`Port configure: ${process.env.PORT || 'non defini (usage du port 5000)'}`)
  logger.info(`Origines CORS autorisees: ${allowedOrigins.join(', ')}`)
})
