type LogContext = Record<string, unknown>;
type LogLevel = "debug" | "info" | "warn" | "error";

const isProduction = process.env.NODE_ENV === "production";

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  const payload = {
    context,
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case "debug":
      if (!isProduction) {
        console.debug(payload);
      }
      break;
    case "info":
      console.info(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "error":
      console.error(payload);
      break;
  }
}

export const log = {
  debug(message: string, context?: LogContext): void {
    writeLog("debug", message, context);
  },
  error(message: string, context?: LogContext): void {
    writeLog("error", message, context);
  },
  info(message: string, context?: LogContext): void {
    writeLog("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    writeLog("warn", message, context);
  },
};
