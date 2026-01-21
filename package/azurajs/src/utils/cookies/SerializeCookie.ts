import type { CookieOptions } from "../../types/http/response.type";

export function serializeCookie(name: string, val: string, opts: CookieOptions = {}): string {
  const encode = opts.encode ?? encodeURIComponent;
  let str = `${name}=${encode(val)}`;
  if (opts.maxAge != null && !Number.isNaN(Number(opts.maxAge)))
    str += `; Max-Age=${Math.floor(Number(opts.maxAge))}`;
  if (opts.domain) str += `; Domain=${opts.domain}`;
  if (opts.path) str += `; Path=${opts.path}`;
  if (opts.expires) str += `; Expires=${opts.expires.toUTCString()}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.secure) str += `; Secure`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  return str;
}
