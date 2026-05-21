type LogContext = Record<string, unknown>;

export const log = {
  info(msg: string, ctx?: LogContext): void {
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({level: "info", msg, ...ctx}));
    }
  },
  error(msg: string, ctx?: LogContext): void {
    console.error(JSON.stringify({level: "error", msg, ...ctx}));
  },
};
