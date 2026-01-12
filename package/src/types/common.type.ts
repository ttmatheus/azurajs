import type { RequestServer } from "./http/request.type";
import type { ResponseServer } from "./http/response.type";

type NextFunction = (err?: Error | any) => void | Promise<void>;

type TraditionalHandler = (req: RequestServer, res: ResponseServer, next?: NextFunction) => void | Promise<void>;
type DestructuredHandler = (ctx: { req: RequestServer; res: ResponseServer; next?: NextFunction }) => void | Promise<void>;

export type RequestHandler = TraditionalHandler | DestructuredHandler;

export interface HttpContext {
  request: RequestServer;
  response: ResponseServer;
  body?: Buffer | string;
}