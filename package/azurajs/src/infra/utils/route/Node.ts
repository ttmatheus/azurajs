import type { RequestServer } from "../../../types/http/request.type";
import type { ResponseServer } from "../../../types/http/response.type";

export type Handler = (ctx: {
  req: RequestServer;
  res: ResponseServer;
  next?: (err?: any) => void;
}) => Promise<void> | void;

export class Node {
  children = new Map<string, Node>();
  handlers = new Map<string, Handler[]>();
  paramName?: string;
  isParam?: boolean;
}
