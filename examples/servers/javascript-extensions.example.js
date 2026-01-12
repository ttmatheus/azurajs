/**
 * Examples of extending Azura in pure JavaScript (without TypeScript)
 * This is similar to Express: app.response.methodName = function() {}
 */

const { AzuraClient } = require('azura');

const app = new AzuraClient();

// ============================================
// Method 1: Extend Response prototype directly
// Similar to Express: app.response.send = function() {}
// ============================================

// You can access the underlying Response class and extend it
app.use((req, res, next) => {
  // Add custom methods directly to the response object
  
  /**
   * Send a success response
   */
  res.sendSuccess = function(data, message) {
    return this.status(200).json({
      success: true,
      message: message || 'Request successful',
      data,
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Send an error response
   */
  res.sendError = function(message, code) {
    return this.status(code || 400).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Paginate results
   */
  res.paginate = function(data, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return this.status(200).json({
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
    });
  };
  
  next();
});

// ============================================
// Method 2: Extend Request prototype
// ============================================

app.use((req, res, next) => {
  /**
   * Check if user is authenticated
   */
  req.isAuthenticated = function() {
    return !!this.user;
  };
  
  /**
   * Check if user has a specific role
   */
  req.hasRole = function(role) {
    return this.user && this.user.role === role;
  };
  
  /**
   * Get user ID
   */
  req.getUserId = function() {
    return this.user ? this.user.id : null;
  };
  
  next();
});

// ============================================
// Method 3: Using a helper function to extend
// ============================================

/**
 * Helper function to add methods to response
 */
function extendResponse(app) {
  app.use((req, res, next) => {
    // Not found helper
    res.notFound = function(message) {
      return this.status(404).json({ 
        error: message || 'Not found' 
      });
    };
    
    // Bad request helper
    res.badRequest = function(message) {
      return this.status(400).json({ 
        error: message || 'Bad request' 
      });
    };
    
    // Unauthorized helper
    res.unauthorized = function(message) {
      return this.status(401).json({ 
        error: message || 'Unauthorized' 
      });
    };
    
    // Forbidden helper
    res.forbidden = function(message) {
      return this.status(403).json({ 
        error: message || 'Forbidden' 
      });
    };
    
    // Server error helper
    res.serverError = function(message) {
      return this.status(500).json({ 
        error: message || 'Internal server error' 
      });
    };
    
    next();
  });
}

// Apply the extension
extendResponse(app);

// ============================================
// Method 4: Session management
// ============================================

const sessions = new Map();

app.use((req, res, next) => {
  const sessionId = req.cookies['session-id'];
  
  if (sessionId && sessions.has(sessionId)) {
    req.session = sessions.get(sessionId);
  }
  
  /**
   * Start a new session
   */
  req.startSession = function(data) {
    const id = Math.random().toString(36).substring(7);
    const session = {
      id,
      data: data || {},
      createdAt: new Date()
    };
    
    sessions.set(id, session);
    this.session = session;
    res.cookie('session-id', id, { httpOnly: true });
    return session;
  };
  
  /**
   * Destroy session
   */
  req.destroySession = function() {
    if (this.session) {
      sessions.delete(this.session.id);
      this.session = undefined;
      res.clearCookie('session-id');
    }
  };
  
  /**
   * Update session data
   */
  req.updateSession = function(data) {
    if (this.session) {
      Object.assign(this.session.data, data);
      sessions.set(this.session.id, this.session);
    }
  };
  
  next();
});

// ============================================
// Method 5: Extend AzuraClient prototype
// Similar to Express custom methods
// ============================================

/**
 * Add health check endpoint
 */
AzuraClient.prototype.health = function(path) {
  const healthPath = path || '/health';
  this.get(healthPath, (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now()
    });
  });
  console.log(`Health check enabled at ${healthPath}`);
};

/**
 * Add version endpoint
 */
AzuraClient.prototype.version = function(version, path) {
  const versionPath = path || '/version';
  this.get(versionPath, (req, res) => {
    res.json({ version });
  });
};

/**
 * Add CORS preflight for all OPTIONS requests
 */
AzuraClient.prototype.enableCors = function(options) {
  const opts = options || {};
  const origin = opts.origin || '*';
  const methods = opts.methods || 'GET,POST,PUT,DELETE,PATCH';
  const headers = opts.headers || 'Content-Type,Authorization';
  
  this.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', methods);
    res.set('Access-Control-Allow-Headers', headers);
    
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    next();
  });
  
  console.log('CORS enabled');
};

// Use the new methods
app.health();
app.health('/status');
app.version('1.0.0');
app.enableCors({ origin: 'http://localhost:3000' });

// ============================================
// Using the extended methods in routes
// ============================================

// Authentication example
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials (example)
  if (email === 'user@example.com' && password === 'password') {
    req.startSession({ userId: '123', email });
    return res.sendSuccess({ message: 'Login successful' });
  }
  
  return res.unauthorized('Invalid credentials');
});

app.post('/logout', (req, res) => {
  req.destroySession();
  res.sendSuccess({ message: 'Logout successful' });
});

// Protected route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.unauthorized('Authentication required');
  }
  
  res.sendSuccess(req.user);
});

// Pagination example
app.get('/users', (req, res) => {
  const users = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`
  }));
  
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  
  res.paginate(users, page, limit);
});

// Error examples
app.get('/not-found', (req, res) => {
  res.notFound('Resource not found');
});

app.get('/bad-request', (req, res) => {
  res.badRequest('Invalid request data');
});

app.get('/forbidden', (req, res) => {
  res.forbidden('Access denied');
});

// ============================================
// Method 6: Database/ORM integration
// ============================================

// Example with Prisma or any ORM
const prisma = require('@prisma/client');
const db = new prisma.PrismaClient();

app.use((req, res, next) => {
  // Make database available on request
  req.db = db;
  next();
});

// Now you can use req.db in any route
app.get('/api/users', async (req, res) => {
  try {
    const users = await req.db.user.findMany();
    res.sendSuccess(users);
  } catch (error) {
    res.serverError(error.message);
  }
});

// ============================================
// Method 7: Request validation helper
// ============================================

app.use((req, res, next) => {
  /**
   * Validate request body with a schema
   */
  req.validate = function(schema) {
    // Works with Joi, Yup, Zod, etc
    const { error, value } = schema.validate(this.body);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return value;
  };
  
  /**
   * Require specific fields
   */
  req.requireFields = function(...fields) {
    const missing = [];
    
    for (const field of fields) {
      if (!this.body[field]) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return this.body;
  };
  
  next();
});

// Usage
app.post('/api/create', (req, res) => {
  try {
    // Validate required fields
    req.requireFields('name', 'email');
    
    const data = req.body;
    // Create resource...
    
    res.sendSuccess({ id: 123, ...data }, 'Created successfully');
  } catch (error) {
    res.badRequest(error.message);
  }
});

// ============================================
// Method 8: Response timing
// ============================================

app.use((req, res, next) => {
  const startTime = Date.now();
  
  /**
   * Send response with timing information
   */
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Add timing header
    this.set('X-Response-Time', `${responseTime}ms`);
    
    // If data is an object, add timing to it
    if (typeof data === 'object' && data !== null) {
      data._meta = {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    }
    
    return originalJson(data);
  };
  
  next();
});

// ============================================
// Method 9: Smart error handling
// ============================================

function setupErrorHandling(app) {
  app.use((req, res, next) => {
    /**
     * Try-catch wrapper for async route handlers
     */
    res.asyncHandler = function(handler) {
      return async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          console.error('Error:', error);
          res.serverError(error.message);
        }
      };
    };
    
    next();
  });
}

setupErrorHandling(app);

// ============================================
// Method 10: IP and security helpers
// ============================================

app.use((req, res, next) => {
  /**
   * Check if request is from localhost
   */
  req.isLocalhost = function() {
    return this.ip === '127.0.0.1' || 
           this.ip === '::1' || 
           this.ip.startsWith('192.168.') ||
           this.ip.startsWith('10.');
  };
  
  /**
   * Check if request is from specific IP
   */
  req.isFromIp = function(ip) {
    return this.ip === ip;
  };
  
  /**
   * Check if request is HTTPS
   */
  req.isSecure = function() {
    return this.secure || this.protocol === 'https';
  };
  
  next();
});

// Usage
app.get('/admin', (req, res) => {
  if (!req.isLocalhost()) {
    return res.forbidden('Access denied: Admin panel only accessible from localhost');
  }
  
  res.json({ message: 'Welcome to admin panel' });
});

// ============================================
// Start server
// ============================================

app.listen(3000).then(() => {
  console.log('Server running on http://localhost:3000');
  console.log('Custom methods enabled:');
  console.log('  - res.sendSuccess(data, message)');
  console.log('  - res.sendError(message, code)');
  console.log('  - res.paginate(data, page, limit)');
  console.log('  - res.notFound(), res.badRequest(), etc.');
  console.log('  - req.isAuthenticated()');
  console.log('  - req.startSession(), req.destroySession()');
  console.log('  - app.health(), app.version()');
});

module.exports = { app };
