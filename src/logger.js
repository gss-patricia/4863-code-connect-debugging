import { createLogger, format, transports } from "winston"

const logTransports = [
    new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`
                if (Object.keys(meta.length > 0)) msg += ` ${JSON.stringify(meta)}`
                return msg
            })
        )
    })
]

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: "YYYY-mm-dd HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: { service: "code-connect" },
    transports: logTransports
})

export default logger