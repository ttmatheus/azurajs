/**
 * Advanced Cookie Manager for Azura
 * Type-safe cookie handling with signing, encryption, and session management
 */

import { createHmac, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type {
  CookieOptions,
  CookieParseOptions,
  SessionStore,
  SessionManagerOptions,
  Session,
  SessionCreateResult,
  MemorySessionData,
  CookiePresets as CookiePresetsType,
  CookieJarEntry
} from '../../types/cookies.type';

/**
 * Cookie jar for managing multiple cookies
 */
export class CookieJar {
  private cookies: Map<string, CookieJarEntry> = new Map();
  private secret?: string;
  private encryptionKey?: Buffer;
  
  constructor(secret?: string) {
    this.secret = secret;
    if (secret) {
      // Derive encryption key from secret
      this.encryptionKey = Buffer.from(
        createHmac('sha256', secret).update('encryption').digest('hex').slice(0, 32)
      );
    }
  }
  
  /**
   * Set a cookie
   */
  set(name: string, value: string, options: CookieOptions = {}): string {
    let finalValue = value;
    
    // Encrypt if requested
    if (options.encrypted && this.encryptionKey) {
      finalValue = this.encrypt(value);
    }
    
    // Sign if requested
    if (options.signed && this.secret) {
      finalValue = this.sign(finalValue);
    }
    
    this.cookies.set(name, { value: finalValue, options });
    
    return this.serialize(name, finalValue, options);
  }
  
  /**
   * Get a cookie value
   */
  get(name: string, signed = false, encrypted = false): string | undefined {
    const cookie = this.cookies.get(name);
    if (!cookie) return undefined;
    
    let value = cookie.value;
    
    // Verify signature if signed
    if (signed && this.secret) {
      const unsigned = this.unsign(value);
      if (!unsigned) return undefined;
      value = unsigned;
    }
    
    // Decrypt if encrypted
    if (encrypted && this.encryptionKey) {
      try {
        value = this.decrypt(value);
      } catch {
        return undefined;
      }
    }
    
    return value;
  }
  
  /**
   * Delete a cookie
   */
  delete(name: string, options: Partial<Pick<CookieOptions, 'domain' | 'path'>> = {}): string {
    this.cookies.delete(name);
    return this.serialize(name, '', {
      ...options,
      expires: new Date(0),
      maxAge: -1
    });
  }
  
  /**
   * Check if cookie exists
   */
  has(name: string): boolean {
    return this.cookies.has(name);
  }
  
  /**
   * Get all cookies
   */
  all(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [name, { value }] of this.cookies) {
      result[name] = value;
    }
    return result;
  }
  
  /**
   * Clear all cookies
   */
  clear(): void {
    this.cookies.clear();
  }
  
  /**
   * Sign a value
   */
  private sign(value: string): string {
    if (!this.secret) return value;
    const signature = createHmac('sha256', this.secret)
      .update(value)
      .digest('base64')
      .replace(/=+$/, '');
    return `${value}.${signature}`;
  }
  
  /**
   * Verify and unsign a value
   */
  private unsign(signedValue: string): string | undefined {
    if (!this.secret) return signedValue;
    
    const lastDot = signedValue.lastIndexOf('.');
    if (lastDot === -1) return undefined;
    
    const value = signedValue.slice(0, lastDot);
    const signature = signedValue.slice(lastDot + 1);
    
    const expectedSignature = createHmac('sha256', this.secret)
      .update(value)
      .digest('base64')
      .replace(/=+$/, '');
    
    if (signature !== expectedSignature) return undefined;
    
    return value;
  }
  
  /**
   * Encrypt a value
   */
  private encrypt(value: string): string {
    if (!this.encryptionKey) return value;
    
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return `${iv.toString('base64')}.${encrypted}`;
  }
  
  /**
   * Decrypt a value
   */
  private decrypt(encryptedValue: string): string {
    if (!this.encryptionKey) return encryptedValue;
    
    const [ivBase64, encrypted] = encryptedValue.split('.');
    if (!ivBase64 || !encrypted) throw new Error('Invalid encrypted value');
    
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Serialize cookie to Set-Cookie header format
   */
  private serialize(name: string, value: string, options: CookieOptions = {}): string {
    const encode = options.encode ?? encodeURIComponent;
    let str = `${name}=${encode(value)}`;
    
    if (options.maxAge != null && !Number.isNaN(Number(options.maxAge))) {
      str += `; Max-Age=${Math.floor(Number(options.maxAge))}`;
    }
    
    if (options.domain) {
      str += `; Domain=${options.domain}`;
    }
    
    if (options.path) {
      str += `; Path=${options.path}`;
    }
    
    if (options.expires) {
      str += `; Expires=${options.expires.toUTCString()}`;
    }
    
    if (options.httpOnly) {
      str += `; HttpOnly`;
    }
    
    if (options.secure) {
      str += `; Secure`;
    }
    
    if (options.sameSite) {
      const sameSite = options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1);
      str += `; SameSite=${sameSite}`;
    }
    
    if (options.priority) {
      const priority = options.priority.charAt(0).toUpperCase() + options.priority.slice(1);
      str += `; Priority=${priority}`;
    }
    
    return str;
  }
}

/**
 * Parse Cookie header
 */
export function parseCookies(
  header: string | undefined,
  options: CookieParseOptions = {}
): Record<string, string> {
  if (!header) return {};
  
  const decode = options.decode ?? decodeURIComponent;
  const cookies: Record<string, string> = {};
  
  const pairs = header.split(';');
  
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    
    if (eqIdx === -1) continue;
    
    const key = pair.slice(0, eqIdx).trim();
    let value = pair.slice(eqIdx + 1).trim();
    
    // Remove quotes if present
    if (value.charAt(0) === '"') {
      value = value.slice(1, -1);
    }
    
    if (!cookies[key]) {
      try {
        cookies[key] = decode(value);
      } catch {
        cookies[key] = value;
      }
    }
  }
  
  return cookies;
}

/**
 * Memory session store (for development)
 */
export class MemorySessionStore implements SessionStore {
  private store = new Map<string, MemorySessionData>();
  
  async get(id: string): Promise<any | undefined> {
    const session = this.store.get(id);
    if (!session) return undefined;
    
    if (Date.now() > session.expires) {
      this.store.delete(id);
      return undefined;
    }
    
    return session.data;
  }
  
  async set(id: string, data: any, maxAge = 86400000): Promise<void> {
    this.store.set(id, {
      data,
      expires: Date.now() + maxAge
    });
  }
  
  async destroy(id: string): Promise<void> {
    this.store.delete(id);
  }
  
  async touch(id: string, maxAge = 86400000): Promise<void> {
    const session = this.store.get(id);
    if (session) {
      session.expires = Date.now() + maxAge;
    }
  }
  
  /**
   * Clear expired sessions
   */
  cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.store) {
      if (now > session.expires) {
        this.store.delete(id);
      }
    }
  }
}

/**
 * Session manager
 */
export class SessionManager {
  private store: SessionStore;
  private cookieName: string;
  private cookieOptions: CookieOptions;
  private cookieJar: CookieJar;
  
  constructor(
    store: SessionStore = new MemorySessionStore(),
    options: SessionManagerOptions = {}
  ) {
    this.store = store;
    this.cookieName = options.cookieName || 'azura.sid';
    this.cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
      ...options.cookieOptions
    };
    this.cookieJar = new CookieJar(options.secret);
  }
  
  /**
   * Generate session ID
   */
  private generateId(): string {
    return randomBytes(32).toString('hex');
  }
  
  /**
   * Get session
   */
  async get(cookies: Record<string, string>): Promise<Session | undefined> {
    const sessionId = cookies[this.cookieName];
    if (!sessionId) return undefined;
    
    const data = await this.store.get(sessionId);
    if (!data) return undefined;
    
    return { id: sessionId, data };
  }
  
  /**
   * Create new session
   */
  async create(data: any = {}): Promise<SessionCreateResult> {
    const id = this.generateId();
    await this.store.set(id, data, (this.cookieOptions.maxAge || 86400) * 1000);
    
    const cookie = this.cookieJar.set(this.cookieName, id, this.cookieOptions);
    
    return { id, cookie };
  }
  
  /**
   * Update session
   */
  async update(id: string, data: any): Promise<void> {
    await this.store.set(id, data, (this.cookieOptions.maxAge || 86400) * 1000);
  }
  
  /**
   * Destroy session
   */
  async destroy(id: string): Promise<string> {
    await this.store.destroy(id);
    return this.cookieJar.delete(this.cookieName, {
      path: this.cookieOptions.path,
      domain: this.cookieOptions.domain
    });
  }
  
  /**
   * Touch session (update expiration)
   */
  async touch(id: string): Promise<void> {
    await this.store.touch(id, (this.cookieOptions.maxAge || 86400) * 1000);
  }
}

/**
 * Cookie preset configurations
 */
export const CookiePresets: CookiePresetsType = {
  /**
   * Secure session cookie
   */
  session: (secure = false): CookieOptions => ({
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400 // 24 hours
  }),
  
  /**
   * Remember me cookie
   */
  rememberMe: (secure = false): CookieOptions => ({
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 2592000 // 30 days
  }),
  
  /**
   * Tracking cookie
   */
  tracking: (secure = false): CookieOptions => ({
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 31536000 // 1 year
  }),
  
  /**
   * Flash message cookie
   */
  flash: (secure = false): CookieOptions => ({
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/'
    // No maxAge - session cookie
  }),
  
  /**
   * CSRF token cookie
   */
  csrf: (secure = false): CookieOptions => ({
    httpOnly: false,
    secure,
    sameSite: 'strict',
    path: '/'
  })
};
