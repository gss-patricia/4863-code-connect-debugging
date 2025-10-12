import winston from "winston";

// Configuração do Winston
export const createLogger = (service = "app") => {
  const transports = [
    // Console transport (funciona em todo lugar)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ];

  // ✅ File transports APENAS em desenvolvimento local
  // Na Vercel/produção, filesystem é read-only
  // Vercel seta a variável VERCEL=1 automaticamente
  const isVercel = process.env.VERCEL === "1";
  const isServer = typeof window === "undefined";

  if (!isVercel && isServer) {
    try {
      transports.push(
        // File transport para erros
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),

        // File transport para todos os logs
        new winston.transports.File({
          filename: "logs/combined.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    } catch (error) {
      // Se der erro ao criar File transport, ignora e continua só com Console
      console.warn(
        "⚠️ Não foi possível criar file transports, usando apenas console"
      );
    }
  }

  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports,
  });
};

export default createLogger;
