// Event Logger - Sistema de rastreamento de eventos do usuário
// Funciona tanto no servidor (Node) quanto no cliente (Browser)

// Importar logger Winston apenas no servidor
let logger = null;
if (typeof window === "undefined") {
  // Estamos no servidor
  logger = (await import("../logger.js")).default;
}

// Constantes para organizar os eventos
export const EVENT_STEPS = {
  AUTH: "AUTH",
  VIEW: "VIEW",
  INTERACTION: "INTERACTION",
  API: "API",
  DATABASE: "DATABASE",
};

export const EVENT_OPERATIONS = {
  // AUTH
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILED: "REGISTER_FAILED",

  // VIEW
  VIEW_HOME: "VIEW_HOME",
  VIEW_POST_DETAILS: "VIEW_POST_DETAILS",

  // INTERACTION
  SUBMIT_COMMENT: "SUBMIT_COMMENT",
  SUBMIT_REPLY: "SUBMIT_REPLY",
  LIKE_POST: "LIKE_POST",

  // API
  API_GET_POST: "API_GET_POST",
  API_GET_REPLIES: "API_GET_REPLIES",
  API_UNAUTHORIZED: "API_UNAUTHORIZED",

  // DATABASE
  DB_MUTATION_SUCCESS: "DB_MUTATION_SUCCESS",
  DB_MUTATION_FAILED: "DB_MUTATION_FAILED",
};

// ========== FUNÇÕES AUXILIARES (PRIVADAS) ==========

/**
 * Captura timezone do usuário (server ou client)
 */
function getTimezone() {
  if (typeof window !== "undefined") {
    // Browser
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } else {
    // Server (Node)
    return process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

/**
 * Formata o contexto do evento
 */
function formatEventContext(userId, additionalData = {}) {
  return {
    timestamp: new Date().toISOString(),
    userId: userId || "anonymous",
    timezone: {
      user: getTimezone(),
      server: process.env.TZ || "UTC",
    },
    environment: process.env.NODE_ENV || "development",
    ...additionalData,
  };
}

// ========== FUNÇÕES PRINCIPAIS (PÚBLICAS) ==========

/**
 * Log de evento (fire-and-forget, não bloqueia execução)
 * @param {string} step - Etapa do fluxo (AUTH, VIEW, etc)
 * @param {string} operation - Operação específica (LOGIN_SUCCESS, etc)
 * @param {string} userId - ID do usuário
 * @param {object} metadata - Dados adicionais
 */
export function logEvent(step, operation, userId, metadata = {}) {
  const context = formatEventContext(userId, {
    step,
    operation,
    ...metadata,
  });

  // SERVER: Usar Winston (se disponível)
  if (logger) {
    logger.info(`[EVENT] ${step} → ${operation}`, context);
  } else {
    // BROWSER ou SERVER sem Winston (Vercel sem file access)
    // Log estruturado para Vercel capturar
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
}

/**
 * Log de erro em evento
 */
export function logEventError(step, operation, userId, error, metadata = {}) {
  const context = formatEventContext(userId, {
    step,
    operation,
    error: error?.message || error,
    stack: error?.stack,
    ...metadata,
  });

  // SERVER: Usar Winston (se disponível)
  if (logger) {
    logger.error(`[EVENT ERROR] ${step} → ${operation}`, context);
  } else {
    // BROWSER ou SERVER sem Winston
    if (process.env.NODE_ENV !== "test") {
      console.error(
        JSON.stringify({
          type: "EVENT",
          level: "error",
          step,
          operation,
          ...context,
        })
      );
    }
  }
}

/**
 * Log de warning em evento
 */
export function logEventWarning(
  step,
  operation,
  userId,
  message,
  metadata = {}
) {
  const context = formatEventContext(userId, {
    step,
    operation,
    warning: message,
    ...metadata,
  });

  // SERVER: Usar Winston (se disponível)
  if (logger) {
    logger.warn(`[EVENT WARNING] ${step} → ${operation}`, context);
  } else {
    // BROWSER ou SERVER sem Winston
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        JSON.stringify({
          type: "EVENT",
          level: "warn",
          step,
          operation,
          ...context,
        })
      );
    }
  }
}

// ========== HELPERS PARA EVENTOS ESPECÍFICOS ==========

/**
 * Log de login (sucesso ou falha)
 */
export function logLogin(userId, success, error = null) {
  if (success) {
    logEvent(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGIN_SUCCESS, userId);
  } else {
    logEventError(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGIN_FAILED, null, error);
  }
}

/**
 * Log de visualização da home
 */
export function logViewHome(userId, metadata = {}) {
  logEvent(EVENT_STEPS.VIEW, EVENT_OPERATIONS.VIEW_HOME, userId, metadata);
}

/**
 * Log de visualização de post
 */
export function logViewPost(userId, postId, slug, metadata = {}) {
  logEvent(EVENT_STEPS.VIEW, EVENT_OPERATIONS.VIEW_POST_DETAILS, userId, {
    postId,
    slug,
    ...metadata,
  });
}

/**
 * Log de envio de comentário
 */
export function logSubmitComment(userId, postId, commentCreated, error = null) {
  if (commentCreated) {
    logEvent(EVENT_STEPS.INTERACTION, EVENT_OPERATIONS.SUBMIT_COMMENT, userId, {
      postId,
      commentCreated: true,
    });
  } else {
    logEventError(
      EVENT_STEPS.INTERACTION,
      EVENT_OPERATIONS.SUBMIT_COMMENT,
      userId,
      error,
      { postId }
    );
  }
}

/**
 * Log de envio de resposta
 */
export function logSubmitReply(
  userId,
  postId,
  commentId,
  replyCreated,
  error = null
) {
  if (replyCreated) {
    logEvent(EVENT_STEPS.INTERACTION, EVENT_OPERATIONS.SUBMIT_REPLY, userId, {
      postId,
      commentId,
      replyCreated: true,
    });
  } else {
    logEventError(
      EVENT_STEPS.INTERACTION,
      EVENT_OPERATIONS.SUBMIT_REPLY,
      userId,
      error,
      { postId, commentId }
    );
  }
}
