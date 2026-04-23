/* eslint-disable no-console */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Logger centralisé pour homogénéiser les logs dans EmiID
 * @created 2026-03-26
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

const isDev = process.env.NODE_ENV === 'development'

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

interface LoggerConfig {
    shouldLogInProd: boolean
    prefix?: string
}

class Logger {
    private config: LoggerConfig

    constructor(config: LoggerConfig = { shouldLogInProd: false }) {
        this.config = config
    }

    private shouldLog(level: LogLevel): boolean {
        // En développement, on logge tout
        if (isDev) return true

        // En production, on logge seulement les erreurs et warnings
        if (this.config.shouldLogInProd) {
            return level === 'error' || level === 'warn'
        }

        return false
    }

    private formatMessage(message: unknown): string {
        const prefix = this.config.prefix ? `[${this.config.prefix}] ` : ''
        const timestamp = new Date().toISOString()
        return `${prefix}${timestamp} - ${message}`
    }

    log(message: unknown, ...args: unknown[]): void {
        if (this.shouldLog('log')) {
            console.log(this.formatMessage(message), ...args)
        }
    }

    error(message: unknown, ...args: unknown[]): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage(message), ...args)
        }
    }

    warn(message: unknown, ...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage(message), ...args)
        }
    }

    info(message: unknown, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage(message), ...args)
        }
    }

    debug(message: unknown, ...args: unknown[]): void {
        if (isDev && this.shouldLog('debug')) {
            console.debug(this.formatMessage(message), ...args)
        }
    }
}

// Export d'un logger par défaut pour le frontend
export const logger = new Logger({
    shouldLogInProd: false,
    prefix: 'EmiID'
})

// Export du constructeur pour créer des loggers spécialisés
export { Logger }
