import { createLogger, format, transports } from "winston";

// Lista de transports (destinos dos logs)
const logTransports = [
  // Console: sempre ativo (dev e prod)
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ level, message, timestamp, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
      })
    ),
  }),
];

// File transports: apenas em ambiente local (não na Vercel)
if (!process.env.VERCEL && typeof window === "undefined") {
  logTransports.push(
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "logs/combined.log",
      format: format.combine(format.timestamp(), format.json()),
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "code-connect" },
  transports: logTransports,
});

export default logger;
