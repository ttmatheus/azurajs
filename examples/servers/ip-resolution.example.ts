/**
 * Examples of IP resolution with different trust proxy configurations
 * 
 * ⚠️ IMPORTANT: If req.ip is returning empty or undefined:
 * 1. Make sure you have configured trustProxy in azura.config.ts
 * 2. For apps behind proxies/load balancers (Nginx, Cloudflare, AWS ELB), set trustProxy: true
 * 3. For development/direct connections, trustProxy should be false (default)
 */

import { AzuraClient } from '../../package/src/infra/Server';

const app = new AzuraClient();

// ============================================
// Example 0: Check your current IP
// ============================================
app.get('/', (req, res) => {
  res.json({
    ip: req.ip,           
    ips: req.ips,         
    method: req.method,
    path: req.path,
    headers: {
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-real-ip': req.get('x-real-ip'),
    },
    tip: req.ip ? '✅ IP resolved successfully!' : '⚠️ No IP found - check trustProxy config'
  });
});

// ============================================
// Example 1: Basic IP resolution (no proxy trust)
// ============================================
app.get('/ip/basic', (req, res) => {
  res.json({
    ip: req.ip,           // Direct socket IP
    ips: req.ips,         // Empty or socket IP only
    explanation: 'No proxy headers are trusted (default behavior)'
  });
});

// ============================================
// Example 2: Trust all proxies
// ============================================
// In azura.config.ts:
// export default {
//   server: {
//     trustProxy: true
//   }
// }

app.get('/ip/trust-all', (req, res) => {
  res.json({
    ip: req.ip,           // First IP from X-Forwarded-For
    ips: req.ips,         // All IPs from the chain
    explanation: 'Trusting all proxies - client IP from X-Forwarded-For header'
  });
});

// ============================================
// Example 3: Trust specific proxy IP
// ============================================
// In azura.config.ts:
// export default {
//   server: {
//     trustProxy: '10.0.0.1'  // Trust only this specific proxy
//   }
// }

app.get('/ip/trust-specific', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    explanation: 'Only trusting proxy at 10.0.0.1'
  });
});

// ============================================
// Example 4: Trust CIDR ranges
// ============================================
// In azura.config.ts:
// export default {
//   server: {
//     trustProxy: ['10.0.0.0/8', '172.16.0.0/12']  // Trust private networks
//   }
// }

app.get('/ip/trust-cidr', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    explanation: 'Trusting proxies in specified CIDR ranges'
  });
});

// ============================================
// Example 5: Trust N hops
// ============================================
// In azura.config.ts:
// export default {
//   server: {
//     trustProxy: 1  // Trust one proxy hop
//   }
// }

app.get('/ip/trust-hops', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    explanation: 'Trusting 1 hop from client'
  });
});

// ============================================
// Example 6: Cloudflare setup
// ============================================
// In azura.config.ts:
// import { COMMON_PROXY_RANGES } from 'azura';
// 
// export default {
//   server: {
//     trustProxy: COMMON_PROXY_RANGES.CLOUDFLARE,
//     ipHeader: 'cf-connecting-ip'  // Cloudflare's header
//   }
// }

app.get('/ip/cloudflare', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    cloudflareCountry: req.header('cf-ipcountry'),
    explanation: 'Using Cloudflare-specific configuration'
  });
});

// ============================================
// Example 7: Rate limiting by IP
// ============================================
const requestCounts = new Map<string, { count: number; resetAt: number }>();

app.use((req, res, next) => {
  const clientIp = req.ip;
  const now = Date.now();
  const limit = 100;
  const windowMs = 60000; // 1 minute

  const record = requestCounts.get(clientIp);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(clientIp, { count: 1, resetAt: now + windowMs });
    return next?.();
  }

  if (record.count >= limit) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    });
  }

  record.count++;
  next?.();
});

// ============================================
// Example 8: IP-based geolocation
// ============================================
app.get('/ip/location', (req, res) => {
  const clientIp = req.ip;
  
  // In production, use a real geolocation service
  res.json({
    ip: clientIp,
    location: {
      country: 'Unknown',
      city: 'Unknown',
      note: 'Integrate with MaxMind, IP2Location, or similar service'
    }
  });
});

// ============================================
// Example 9: Security - Block specific IPs
// ============================================
const blockedIps = new Set(['192.168.1.100', '10.0.0.50']);

app.use((req, res, next) => {
  if (blockedIps.has(req.ip)) {
    return res.status(403).json({
      error: 'Access denied',
      ip: req.ip
    });
  }
  next?.();
});

// ============================================
// Example 10: Logging with IP
// ============================================
app.use((req, res, next) => {
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.header('user-agent')
  });
  next?.();
});

export { app };
