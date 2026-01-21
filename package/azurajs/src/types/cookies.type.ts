/**
 * Cookie Types
 * Type definitions for Azura cookie management system
 */

/**
 * Cookie options with extended features
 */
export interface CookieOptions {
  /** Cookie domain */
  domain?: string;
  
  /** Custom encoding function */
  encode?: (value: string) => string;
  
  /** Expiration date */
  expires?: Date;
  
  /** HTTP only flag */
  httpOnly?: boolean;
  
  /** Max age in seconds */
  maxAge?: number;
  
  /** Cookie path */
  path?: string;
  
  /** Same site policy */
  sameSite?: 'strict' | 'lax' | 'none';
  
  /** Secure flag (HTTPS only) */
  secure?: boolean;
  
  /** Sign cookie with secret */
  signed?: boolean;
  
  /** Encrypt cookie value */
  encrypted?: boolean;
  
  /** Priority (Chrome feature) */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Cookie parse options
 */
export interface CookieParseOptions {
  /** Custom decoding function */
  decode?: (value: string) => string;
}

/**
 * Session store interface
 */
export interface SessionStore {
  /**
   * Get session data
   */
  get(id: string): Promise<any | undefined>;
  
  /**
   * Set session data
   */
  set(id: string, data: any, maxAge?: number): Promise<void>;
  
  /**
   * Destroy session
   */
  destroy(id: string): Promise<void>;
  
  /**
   * Touch session (update expiration)
   */
  touch(id: string, maxAge?: number): Promise<void>;
}

/**
 * Session manager options
 */
export interface SessionManagerOptions {
  /** Cookie name for session ID */
  cookieName?: string;
  
  /** Secret for signing session cookies */
  secret?: string;
  
  /** Cookie options for session cookie */
  cookieOptions?: CookieOptions;
}

/**
 * Session with ID
 */
export interface Session<T = any> {
  /** Session ID */
  id: string;
  
  /** Session data */
  data: T;
}

/**
 * Session creation result
 */
export interface SessionCreateResult {
  /** Session ID */
  id: string;
  
  /** Set-Cookie header value */
  cookie: string;
}

/**
 * Memory session data
 */
export interface MemorySessionData<T = any> {
  /** Session data */
  data: T;
  
  /** Expiration timestamp */
  expires: number;
}

/**
 * Cookie preset function type
 */
export type CookiePresetFn = (secure?: boolean) => CookieOptions;

/**
 * Cookie presets interface
 */
export interface CookiePresets {
  /** Secure session cookie */
  session: CookiePresetFn;
  
  /** Remember me cookie */
  rememberMe: CookiePresetFn;
  
  /** Tracking cookie */
  tracking: CookiePresetFn;
  
  /** Flash message cookie */
  flash: CookiePresetFn;
  
  /** CSRF token cookie */
  csrf: CookiePresetFn;
}

/**
 * Cookie jar entry
 */
export interface CookieJarEntry {
  /** Cookie value */
  value: string;
  
  /** Cookie options */
  options: CookieOptions;
}
