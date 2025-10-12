import { createLogger } from "./winston-transport.js";

// Winston logger (apenas local, sem Supabase)
const winstonLogger = createLogger("app");

// Níveis de log
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

// Logger para Winston (apenas local)
export class WinstonLogger {
  constructor(service = "app") {
    this.service = service;
  }

  async log(level, message, metadata = {}) {
    try {
      // Apenas Winston (local + console)
      winstonLogger.log(level, message, {
        service: this.service,
        ...metadata,
      });

      return { data: null, error: null };
    } catch (err) {
      winstonLogger.error("Erro no logger:", err);
      return { data: null, error: err };
    }
  }

  async error(message, metadata = {}) {
    return this.log(LOG_LEVELS.ERROR, message, metadata);
  }

  async warn(message, metadata = {}) {
    return this.log(LOG_LEVELS.WARN, message, metadata);
  }

  async info(message, metadata = {}) {
    return this.log(LOG_LEVELS.INFO, message, metadata);
  }

  async debug(message, metadata = {}) {
    return this.log(LOG_LEVELS.DEBUG, message, metadata);
  }
}

// Instância padrão
export const logger = new WinstonLogger();

// Função helper para logs rápidos
export const log = {
  error: (message, metadata) => logger.error(message, metadata),
  warn: (message, metadata) => logger.warn(message, metadata),
  info: (message, metadata) => logger.info(message, metadata),
  debug: (message, metadata) => logger.debug(message, metadata),
};
