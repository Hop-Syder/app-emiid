type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDev = process.env.NODE_ENV !== 'production'

  private format(level: LogLevel, message: string) {
    return `[backend:${level}] ${message}`
  }

  info(message: string, ...args: unknown[]) {
    console.log(this.format('info', message), ...args)
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(this.format('warn', message), ...args)
  }

  error(message: string, ...args: unknown[]) {
    console.error(this.format('error', message), ...args)
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.log(this.format('debug', message), ...args)
    }
  }
}

export const logger = new Logger()
