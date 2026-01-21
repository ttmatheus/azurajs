import { ServerResponse } from "node:http";

export interface CookieOptions {
  domain?: string;
  encode?: (value: string) => string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
}

export interface ResponseServer extends ServerResponse {
  end(cb?: () => void): this;
  end(chunk: any, cb?: () => void): this;
  end(chunk: any, encoding: string, cb?: () => void): this;
  headersSent: boolean;
  status(code: number): this;
  set(field: string, value: string | number | string[]): this;
  header(field: string, value: string | number | string[]): this;
  get(field: string): string | undefined;
  type(type: string): this;
  contentType(type: string): this;
  redirect(url: string): this;
  redirect(status: number, url: string): this;
  location(url: string): this;
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;
  send(body: any): this;
  json(body: any): this;
}
