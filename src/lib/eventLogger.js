/**
 * EVENT LOGGER
 *
 * Logger estruturado para rastrear eventos da aplicação (usuário e sistema).
 * Logs aparecem tanto localmente quanto no Vercel.
 *
 * Funciona tanto no SERVER quanto no CLIENT:
 * - Server: usa Winston (arquivos + console)
 * - Client: usa apenas console.log
 *
 * Níveis:
 * - info: Eventos normais (login, views, etc)
 * - warn: Comportamentos anormais mas não críticos
 * - error: Erros que impedem operações
 * - debug: Informações técnicas (apenas dev)
 */

// Winston só importa no servidor (não funciona no browser)
let log = null;
if (typeof window === "undefined") {
  // Estamos no servidor
  log = require("./logger.js").log;
}

// ========================================
// DEFINIÇÃO DE STEPS E OPERATIONS
// ========================================

export const EVENT_STEPS = {
  AUTH: "AUTH",
  VIEW: "VIEW",
  INTERACTION: "INTERACTION",
  NAVIGATION: "NAVIGATION",
  API: "API",
  DATABASE: "DATABASE",
  SYSTEM: "SYSTEM",
};

export const EVENT_OPERATIONS = {
  // AUTH
  LOGIN_ATTEMPT: "LOGIN_ATTEMPT",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  REGISTER_ATTEMPT: "REGISTER_ATTEMPT",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILED: "REGISTER_FAILED",

  // VIEW
  VIEW_HOME: "VIEW_HOME",
  VIEW_POST_DETAILS: "VIEW_POST_DETAILS",
  VIEW_LOGIN_PAGE: "VIEW_LOGIN_PAGE",
  VIEW_REGISTER_PAGE: "VIEW_REGISTER_PAGE",

  // INTERACTION
  SUBMIT_COMMENT: "SUBMIT_COMMENT",
  SUBMIT_REPLY: "SUBMIT_REPLY",
  LIKE_POST: "LIKE_POST",
  SEARCH: "SEARCH",

  // NAVIGATION
  NAVIGATE_TO_POST: "NAVIGATE_TO_POST",
  NAVIGATE_TO_HOME: "NAVIGATE_TO_HOME",

  // API
  API_GET_POST: "API_GET_POST",
  API_GET_POST_FAILED: "API_GET_POST_FAILED",
  API_GET_REPLIES: "API_GET_REPLIES",
  API_GET_REPLIES_FAILED: "API_GET_REPLIES_FAILED",
  API_UNAUTHORIZED: "API_UNAUTHORIZED",

  // DATABASE
  DB_QUERY_SUCCESS: "DB_QUERY_SUCCESS",
  DB_QUERY_FAILED: "DB_QUERY_FAILED",
  DB_MUTATION_SUCCESS: "DB_MUTATION_SUCCESS",
  DB_MUTATION_FAILED: "DB_MUTATION_FAILED",
};

// ========================================
// EVENT LOGGER CLASS
// ========================================

class EventLogger {
  /**
   * Detecta o timezone do servidor ou usa UTC como fallback
   * @returns {string} Timezone (ex: "America/Sao_Paulo", "UTC")
   */
  _getServerTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (error) {
      return "UTC";
    }
  }

  /**
   * Formata o contexto do evento para o log com informações de timezone
   * @param {string} userId - ID do usuário
   * @param {object} additionalData - Dados adicionais (pode incluir userTimezone)
   * @returns {object} Contexto formatado
   */
  _formatEventContext(userId, additionalData = {}) {
    const now = new Date();
    const serverTimezone = this._getServerTimezone();
    const userTimezone = additionalData.userTimezone || serverTimezone;

    // Remove userTimezone dos additionalData para não duplicar
    const { userTimezone: _, ...restData } = additionalData;

    return {
      timestamp: now.toISOString(),
      userId: userId || "anonymous",
      timezone: {
        server: serverTimezone,
        user: userTimezone,
      },
      environment: process.env.NODE_ENV || "development",
      ...restData,
    };
  }

  /**
   * Log de evento - INFO
   */
  logEvent(step, operation, userId, metadata = {}) {
    const context = this._formatEventContext(userId, {
      step,
      operation,
      ...metadata,
    });

    // ✅ Se estiver no servidor, usar Winston (fire-and-forget)
    if (log) {
      log.info(`[EVENT] ${step} → ${operation}`, context);
    }

    // ✅ Console.log sempre (funciona server e client)
    if (process.env.NODE_ENV !== "test") {
      console.log(
        JSON.stringify({
          type: "EVENT",
          level: "info",
          step,
          operation,
          ...context,
        })
      );
    }
  }

  /**
   * Log de warning
   */
  logEventWarning(step, operation, userId, warning, metadata = {}) {
    const context = this._formatEventContext(userId, {
      step,
      operation,
      warning,
      ...metadata,
    });

    // ✅ Se estiver no servidor, usar Winston (fire-and-forget)
    if (log) {
      log.warn(`[EVENT_WARNING] ${step} → ${operation}: ${warning}`, context);
    }

    // ✅ Console.warn sempre (funciona server e client)
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        JSON.stringify({
          type: "EVENT_WARNING",
          level: "warn",
          step,
          operation,
          warning,
          ...context,
        })
      );
    }
  }

  /**
   * Log de erro
   */
  logEventError(step, operation, userId, error, metadata = {}) {
    const context = this._formatEventContext(userId, {
      step,
      operation,
      error: error?.message || error,
      errorStack: error?.stack,
      ...metadata,
    });

    // ✅ Se estiver no servidor, usar Winston (fire-and-forget)
    if (log) {
      log.error(
        `[EVENT_ERROR] ${step} → ${operation}: ${error?.message || error}`,
        context
      );
    }

    // ✅ Console.error sempre (funciona server e client)
    if (process.env.NODE_ENV !== "test") {
      console.error(
        JSON.stringify({
          type: "EVENT_ERROR",
          level: "error",
          step,
          operation,
          error: error?.message || error,
          ...context,
        })
      );
    }
  }

  // ========================================
  // HELPERS ESPECÍFICOS PARA CADA OPERAÇÃO
  // ========================================

  // AUTH
  logLogin(userId, success = true, error = null) {
    if (success) {
      this.logEvent(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGIN_SUCCESS, userId, {
        sessionStarted: true,
      });
    } else {
      this.logEventError(
        EVENT_STEPS.AUTH,
        EVENT_OPERATIONS.LOGIN_FAILED,
        null,
        error
        // ❌ Sem PII - não logar email ou dados pessoais
      );
    }
  }

  logLogout(userId) {
    this.logEvent(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGOUT, userId, {
      sessionEnded: true,
    });
  }

  logRegister(userId, success = true, error = null) {
    if (success) {
      this.logEvent(
        EVENT_STEPS.AUTH,
        EVENT_OPERATIONS.REGISTER_SUCCESS,
        userId,
        { accountCreated: true }
      );
    } else {
      this.logEventError(
        EVENT_STEPS.AUTH,
        EVENT_OPERATIONS.REGISTER_FAILED,
        null,
        error
        // ❌ Sem PII - não logar email ou dados pessoais
      );
    }
  }

  // VIEW
  logViewHome(userId, metadata = {}) {
    this.logEvent(
      EVENT_STEPS.VIEW,
      EVENT_OPERATIONS.VIEW_HOME,
      userId,
      metadata
    );
  }

  logViewPostDetails(userId, postId, postSlug, metadata = {}) {
    this.logEvent(
      EVENT_STEPS.VIEW,
      EVENT_OPERATIONS.VIEW_POST_DETAILS,
      userId,
      {
        postId,
        postSlug,
        ...metadata,
      }
    );
  }

  // INTERACTION
  logSubmitComment(userId, postId, success = true, error = null) {
    if (success) {
      this.logEvent(
        EVENT_STEPS.INTERACTION,
        EVENT_OPERATIONS.SUBMIT_COMMENT,
        userId,
        { postId, commentCreated: true }
      );
    } else {
      this.logEventError(
        EVENT_STEPS.INTERACTION,
        EVENT_OPERATIONS.SUBMIT_COMMENT,
        userId,
        error,
        { postId }
      );
    }
  }

  logSubmitReply(userId, commentId, postId, success = true, error = null) {
    if (success) {
      this.logEvent(
        EVENT_STEPS.INTERACTION,
        EVENT_OPERATIONS.SUBMIT_REPLY,
        userId,
        { commentId, postId, replyCreated: true }
      );
    } else {
      this.logEventError(
        EVENT_STEPS.INTERACTION,
        EVENT_OPERATIONS.SUBMIT_REPLY,
        userId,
        error,
        { commentId, postId }
      );
    }
  }

  logLikePost(userId, postId) {
    this.logEvent(EVENT_STEPS.INTERACTION, EVENT_OPERATIONS.LIKE_POST, userId, {
      postId,
    });
  }

  logSearch(userId, searchTerm, resultsCount = 0) {
    this.logEvent(EVENT_STEPS.INTERACTION, EVENT_OPERATIONS.SEARCH, userId, {
      searchTerm,
      resultsCount,
    });
  }
}

// ========================================
// EXPORT SINGLETON
// ========================================

export const eventLogger = new EventLogger();
