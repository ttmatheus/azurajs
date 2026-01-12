/**
 * Examples of extending Azura types with custom properties and methods
 */

import { AzuraClient } from '../../package/src/infra/Server';

// ============================================
// Example 1: Extend Request with user authentication
// ============================================
declare module '../types/http/request.type' {
  interface RequestServer {
    user?: {
      id: string;
      email: string;
      role: 'admin' | 'user';
    };
    isAuthenticated(): boolean;
  }
}

// ============================================
// Example 2: Extend Response with custom response methods
// ============================================
declare module '../types/http/response.type' {
  interface ResponseServer {
    sendSuccess(data: any, message?: string): this;
    sendError(message: string, code?: number): this;
    paginate(data: any[], page: number, limit: number): this;
  }
}

// ============================================
// Example 3: Extend AzuraClient with helper methods
// ============================================
declare module '../infra/Server' {
  interface AzuraClient {
    health(path?: string): void;
    enableSwagger(config?: SwaggerConfig): void;
  }
}

interface SwaggerConfig {
  title?: string;
  version?: string;
  basePath?: string;
}

// ============================================
// Implementation of custom request methods
// ============================================
const app = new AzuraClient();

// Add authentication check method to all requests
app.use((req, res, next) => {
  req.isAuthenticated = function() {
    return !!this.user;
  };
  next();
});

// Authentication middleware
app.use((req, res, next) => {
  const token = req.header('authorization')?.replace('Bearer ', '');
  
  if (token) {
    // In production, verify JWT token
    req.user = {
      id: '123',
      email: 'user@example.com',
      role: 'user'
    };
  }
  
  next();
});

// ============================================
// Implementation of custom response methods
// ============================================
app.use((req, res, next) => {
  // Success response helper
  res.sendSuccess = function(data: any, message?: string) {
    return this.status(200).json({
      success: true,
      message: message || 'Request successful',
      data,
      timestamp: new Date().toISOString()
    });
  };
  
  // Error response helper
  res.sendError = function(message: string, code = 400) {
    return this.status(code).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  };
  
  // Pagination helper
  res.paginate = function(data: any[], page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      success: true,
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    };
    
    return this.status(200).json(results);
  };
  
  next();
});

// ============================================
// Implementation of custom AzuraClient methods
// ============================================
AzuraClient.prototype.health = function(path = '/health') {
  this.get(path, (req, res) => {
    res.sendSuccess({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now()
    });
  });
};

AzuraClient.prototype.enableSwagger = function(config: SwaggerConfig = {}) {
  const { title = 'API Documentation', version = '1.0.0', basePath = '/api-docs' } = config;
  
  this.get(basePath, (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: { title, version },
      paths: {}
    });
  });
  
  console.log(`Swagger documentation enabled at ${basePath}`);
};

// ============================================
// Using custom methods in routes
// ============================================

// Health check endpoint
app.health('/status');

// Protected route example
app.get('/api/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendError('Authentication required', 401);
  }
  
  res.sendSuccess(req.user);
});

// Pagination example
app.get('/api/users', (req, res) => {
  const users = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`
  }));
  
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  
  res.paginate(users, page, limit);
});

// Error handling example
app.get('/api/error', (req, res) => {
  res.sendError('Something went wrong', 500);
});

// Success example
app.post('/api/create', (req, res) => {
  const body = req.body as Record<string, any>;
  res.sendSuccess(
    { id: 123, ...body },
    'Resource created successfully'
  );
});

// ============================================
// Example 4: Custom session management
// ============================================
interface Session {
  id: string;
  data: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

declare module '../types/http/request.type' {
  interface RequestServer {
    session?: Session;
    startSession(data?: Record<string, any>): void;
    destroySession(): void;
  }
}

// Session store (in-memory for example)
const sessions = new Map<string, Session>();

app.use((req, res, next) => {
  const sessionId = req.cookies['session-id'];
  
  if (sessionId && sessions.has(sessionId)) {
    req.session = sessions.get(sessionId);
  }
  
  req.startSession = function(data = {}) {
    const newSessionId = Math.random().toString(36).substring(7);
    const session: Session = {
      id: newSessionId,
      data,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    sessions.set(newSessionId, session);
    this.session = session;
    res.cookie('session-id', newSessionId, { httpOnly: true });
  };
  
  req.destroySession = function() {
    if (this.session) {
      sessions.delete(this.session.id);
      this.session = undefined;
      res.clearCookie('session-id');
    }
  };
  
  next();
});

// Using session
app.post('/api/login', (req, res) => {
  // Validate credentials...
  req.startSession({ userId: '123', role: 'admin' });
  res.sendSuccess({ message: 'Logged in successfully' });
});

app.post('/api/logout', (req, res) => {
  req.destroySession();
  res.sendSuccess({ message: 'Logged out successfully' });
});

export { app };
