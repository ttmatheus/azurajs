/**
 * Examples of using the advanced Cookie Manager system
 */

import { AzuraClient } from "../../package/src/infra/Server";
import {
  CookieJar,
  SessionManager,
  MemorySessionStore,
  CookiePresets,
  parseCookies,
} from "../../package/src/utils/cookies/CookieManager";

const app = new AzuraClient();

// ============================================
// Example 1: Basic Cookie Usage
// ============================================

app.get("/set-cookie", (req, res) => {
  res.cookie("username", "john_doe", {
    maxAge: 3600, // 1 hour
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  res.json({ message: "Cookie set!" });
});

app.get("/get-cookie", (req, res) => {
  const username = req.cookies["username"];
  res.json({ username });
});

// ============================================
// Example 2: Using CookieJar for Management
// ============================================

const cookieJar = new CookieJar("my-secret-key");

app.get("/jar/set", (req, res) => {
  const cookieHeader = cookieJar.set("user_id", "12345", {
    httpOnly: true,
    maxAge: 86400,
    secure: true,
  });

  res.setHeader("Set-Cookie", cookieHeader);
  res.json({ message: "Cookie set via CookieJar" });
});

app.get("/jar/get", (req, res) => {
  const userId = cookieJar.get("user_id");
  res.json({ userId });
});

// ============================================
// Example 3: Signed Cookies
// ============================================

const signedJar = new CookieJar("super-secret-signing-key");

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body as any;

  // Validate credentials...
  const userId = "12345";

  // Set signed cookie
  const cookie = signedJar.set("auth_token", userId, {
    signed: true,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 86400, // 24 hours
  });

  res.setHeader("Set-Cookie", cookie);
  res.json({ message: "Logged in successfully" });
});

app.get("/auth/verify", (req, res) => {
  // Get and verify signed cookie
  const authToken = signedJar.get("auth_token", true);

  if (!authToken) {
    return res.status(401).json({ error: "Invalid or missing token" });
  }

  res.json({ userId: authToken, authenticated: true });
});

// ============================================
// Example 4: Encrypted Cookies
// ============================================

const secureJar = new CookieJar("encryption-secret-key");

app.post("/secure/set", (req, res) => {
  const sensitiveData = JSON.stringify({
    ssn: "123-45-6789",
    creditCard: "1234-5678-9012-3456",
  });

  // Encrypt sensitive data
  const cookie = secureJar.set("secure_data", sensitiveData, {
    encrypted: true,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.setHeader("Set-Cookie", cookie);
  res.json({ message: "Encrypted cookie set" });
});

app.get("/secure/get", (req, res) => {
  // Decrypt cookie
  const encryptedData = secureJar.get("secure_data", false, true);

  if (!encryptedData) {
    return res.status(404).json({ error: "No secure data found" });
  }

  const data = JSON.parse(encryptedData);
  res.json(data);
});

// ============================================
// Example 5: Session Management
// ============================================

const sessionManager = new SessionManager(new MemorySessionStore(), {
  cookieName: "azura.sid",
  secret: "session-secret-key",
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 86400, // 24 hours
  },
});

// Middleware to load session
app.use(async (req, res, next) => {
  const session = await sessionManager.get(req.cookies);

  if (session) {
    (req as any).session = session.data;
    (req as any).sessionId = session.id;
  }

  next();
});

app.post("/session/login", async (req, res) => {
  const { email, password } = req.body as any;

  // Validate credentials...

  // Create new session
  const { id, cookie } = await sessionManager.create({
    userId: "12345",
    email,
    loginAt: new Date(),
  });

  res.setHeader("Set-Cookie", cookie);
  res.json({
    message: "Session created",
    sessionId: id,
  });
});

app.get("/session/data", (req, res) => {
  if (!(req as any).session) {
    return res.status(401).json({ error: "No active session" });
  }

  res.json({
    session: (req as any).session,
  });
});

app.post("/session/logout", async (req, res) => {
  if ((req as any).sessionId) {
    const cookie = await sessionManager.destroy((req as any).sessionId);
    res.setHeader("Set-Cookie", cookie);
  }

  res.json({ message: "Logged out" });
});

// ============================================
// Example 6: Cookie Presets
// ============================================

app.post("/remember-me", (req, res) => {
  const { email, rememberMe } = req.body as any;

  if (rememberMe) {
    // Use remember-me preset (30 days)
    res.cookie("user_email", email, CookiePresets.rememberMe(true));
  } else {
    // Use session preset (24 hours)
    res.cookie("user_email", email, CookiePresets.session(true));
  }

  res.json({ message: "Preference saved" });
});

app.post("/tracking", (req, res) => {
  // Use tracking preset (1 year)
  res.cookie("tracking_id", generateTrackingId(), CookiePresets.tracking());
  res.json({ message: "Tracking enabled" });
});

// ============================================
// Example 7: Flash Messages
// ============================================

app.use((req, res, next) => {
  // Get flash message
  const flash = req.cookies["_flash"];
  if (flash) {
    (req as any).flash = JSON.parse(decodeURIComponent(flash));
    // Clear flash cookie
    res.clearCookie("_flash", { path: "/" });
  }

  // Helper to set flash message
  (res as any).setFlash = function (type: string, message: string) {
    const flashData = JSON.stringify({ type, message });
    this.cookie("_flash", flashData, CookiePresets.flash());
    return this;
  };

  next();
});

app.post("/action", (req, res) => {
  // Do something...

  (res as any).setFlash("success", "Action completed successfully!");
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
  res.json({
    flash: (req as any).flash || null,
    message: "Dashboard",
  });
});

// ============================================
// Example 8: CSRF Protection
// ============================================

const csrfTokens = new Map<string, number>();

app.use((req, res, next) => {
  // Generate CSRF token
  if (!req.cookies["csrf_token"]) {
    const token = generateCSRFToken();
    csrfTokens.set(token, Date.now() + 3600000); // 1 hour

    res.cookie("csrf_token", token, CookiePresets.csrf(true));
  }

  next();
});

app.post("/protected-action", (req, res) => {
  const token = req.header("x-csrf-token") || (req.body as any).csrfToken;
  const cookieToken = req.cookies["csrf_token"];

  if (!token || token !== cookieToken || !csrfTokens.has(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  // Check expiration
  const expiry = csrfTokens.get(token);
  if (expiry && expiry < Date.now()) {
    csrfTokens.delete(token);
    return res.status(403).json({ error: "CSRF token expired" });
  }

  // Process action...
  res.json({ message: "Action completed" });
});

// ============================================
// Example 9: Cookie Domain and Path
// ============================================

app.get("/subdomain-cookie", (req, res) => {
  // Cookie accessible across all subdomains
  res.cookie("shared_data", "value", {
    domain: ".example.com",
    path: "/",
    maxAge: 86400,
  });

  res.json({ message: "Cross-subdomain cookie set" });
});

app.get("/specific-path", (req, res) => {
  // Cookie only accessible under /admin
  res.cookie("admin_token", "secret", {
    path: "/admin",
    httpOnly: true,
    secure: true,
  });

  res.json({ message: "Path-specific cookie set" });
});

// ============================================
// Example 10: Cookie Expiration
// ============================================

app.post("/temporary-access", (req, res) => {
  // Expires in 5 minutes
  res.cookie("temp_token", generateToken(), {
    maxAge: 300,
    httpOnly: true,
  });

  res.json({ message: "Temporary token set (5 minutes)" });
});

app.post("/permanent-preference", (req, res) => {
  // Expires in specific date
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  res.cookie("preference", (req.body as any).preference, {
    expires: expiryDate,
    httpOnly: false,
  });

  res.json({ message: "Preference saved for 1 year" });
});

// ============================================
// Example 11: Multiple Cookies at Once
// ============================================

app.post("/multi-cookie", (req, res) => {
  const jar = new CookieJar();

  jar.set("cookie1", "value1", { maxAge: 3600 });
  jar.set("cookie2", "value2", { maxAge: 3600 });
  jar.set("cookie3", "value3", { maxAge: 3600 });

  // Set all cookies
  const allCookies = Object.entries(jar.all()).map(([name, value]) =>
    jar.set(name, value, { maxAge: 3600 })
  );

  res.setHeader("Set-Cookie", allCookies);
  res.json({ message: "Multiple cookies set" });
});

// ============================================
// Helper functions
// ============================================

function generateTrackingId(): string {
  return Math.random().toString(36).substring(7);
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateToken(): string {
  return Math.random().toString(36).substring(7);
}

export { app };
