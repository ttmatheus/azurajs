import type { RequestServer } from "../types/http/request.type";
import type { ResponseServer } from "../types/http/response.type";
import type { ConfigTypes } from "../shared/config/ConfigModule";
import type { RequestHandler } from "../types/common.type";

export function createLoggingMiddleware(config: ConfigTypes): RequestHandler {
  const isEnabled = config.logging?.enabled ?? true;
  const showDetails = config.logging?.showDetails ?? true;
  const env = config.environment || "development";

  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const dim = "\x1b[2m";
  const colors: Record<string, string> = {
    GET: "\x1b[36m",
    POST: "\x1b[32m",
    PUT: "\x1b[33m",
    DELETE: "\x1b[31m",
    PATCH: "\x1b[35m",
    DEFAULT: "\x1b[37m",
  };

  const fn = async (...args: any[]) => {
    let req: RequestServer | undefined;
    let res: ResponseServer | undefined;
    let next: ((err?: any) => Promise<void> | void) | undefined;

    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
      const ctx = args[0];
      req = (ctx.request || ctx.req) as RequestServer | undefined;
      res = (ctx.response || ctx.res) as ResponseServer | undefined;
      next = ctx.next;
    } else {
      req = args[0] as RequestServer | undefined;
      res = args[1] as ResponseServer | undefined;
      next = args[2] as typeof next;
    }

    if (!req || !res) {
      if (typeof next === "function") await next();
      return;
    }

    if (!isEnabled) {
      if (typeof next === "function") await next();
      return;
    }

    const start = Date.now();
    const methodRaw = String(req.method || "GET").toUpperCase();
    const methodPad = methodRaw.padEnd(6, " ");
    const methodColor = colors[methodRaw] || colors.DEFAULT;
    const url = String((req as any).originalUrl || req.url || "/");
    const ip = String((req as any).ip || "").replace("::ffff:", "");
    const time = new Date().toLocaleTimeString("pt-BR", { hour12: false });

    try {
      if (env === "development") {
        const header = `${dim}·${reset} ${bold}${time}${reset}  ${methodColor}${methodPad}${reset} ${bold}${url}${reset}`;
        console.log(header);
        if (showDetails) {
          try {
            if (req.query && Object.keys(req.query).length > 0) {
              console.log(`${dim}   › query:${reset} ${JSON.stringify(req.query)}`);
            }
          } catch {}
          try {
            const params = (req as any).params;
            if (params && Object.keys(params).length > 0) {
              console.log(`${dim}   › params:${reset} ${JSON.stringify(params)}`);
            }
          } catch {}
          try {
            if (req.body && Object.keys(req.body).length > 0) {
              console.log(`${dim}   › body:${reset} ${JSON.stringify(req.body)}`);
            }
          } catch {}
        }
      } else {
        console.log(
          `${dim}·${reset} ${time}  ${methodColor}${methodPad}${reset} ${url} ${dim}• IP:${ip}${reset}`
        );
      }
    } catch {}

    try {
      if (typeof (res as any).on === "function") {
        (res as any).on("finish", () => {
          const duration = Date.now() - start;
          const statusCode = Number((res as any).statusCode || 0);
          const statusColor =
            statusCode >= 500 ? "\x1b[31m" : statusCode >= 400 ? "\x1b[33m" : "\x1b[32m";
          const statusText = `${statusColor}${statusCode}${reset}`;
          const durationText = `${dim}(${duration}ms)${reset}`;
          const ipShort = ip || "-";
          const line = `${dim}→${reset} ${statusText} ${durationText} ${dim}• IP:${ipShort}${reset}`;
          console.log(line);
        });
      }
    } catch {}

    if (typeof next === "function") {
      await next();
    }
  };

  return fn as unknown as RequestHandler;
}
