import { IncomingMessage, type IncomingHttpHeaders } from "node:http";

export interface RequestServer extends IncomingMessage {
  path: string;
  originalUrl: string;
  method: string;
  protocol: "http" | "https";
  secure: boolean;
  hostname: string;
  subdomains: string[];
  ip: string;
  ips?: string[];
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  cookies: Record<string, string>;
  headers: IncomingHttpHeaders;
  
  get(name: string): string | undefined;
  header(name: string): string | undefined;
}