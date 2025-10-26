import { error } from "winston";

let logger = null;
if (typeof window === undefined) {
    logger = (await import("./logger.js")).default
}

function formatEventContext(userId, extra = {}) {
    return {
        timestamp: new Date().toISOString(),
        timezone:
            typeof window !== "undefined" ?
                Intl.DateTimeFormat().resolvedOptions().timeZone // browser
                : process.env.TZ || "UTC",
        userId: userId || "anonymous",
        environment: process.env.NODE_ENV || "development",
        ...extra
    }
}

//Exemplo: LogEvent('AUTH', 'LOGIN_SUCCESS', 'user-123', { mehtod: 'Google' })
export function logEvent(step, operation, userId, metadata = {}) {
    const context = formatEventContext(userId, { step, operation, ...metadata })

    if (logger) {
        logger.info(`[EVENT] ${step} -> ${operation}`, context)
    } else {
        console.log(
            JSON.stringify({
                type: "EVENT",
                level: "info",
                step,
                operation,
                ...context
            })
        )
    }
}

// Exemplo: logEventError('AUTH', 'LOGIN_FAILED, 'user-123', error)
export function logEventError(step, operation, userId, metadata = {}) {
    const context = formatEventContext(userId, {
        step,
        operation,
        error: error?.message || error,
        stack: error?.stack || "",
        ...metadata
    })

    if (logger) {
        logger.error(`[EVENT ERROR] ${step} -> ${operation}`, context)
    } else {
        console.error(
            JSON.stringify({
                type: "EVENT",
                level: "error",
                step,
                operation,
                ...context
            })
        )
    }
}