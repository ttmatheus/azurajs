import type { IncomingMessage } from "node:http";

/**
 * IP resolution configuration interface
 * Similar to Express's 'trust proxy' setting
 */
export interface IpResolverConfig {
  /**
   * Enable trust proxy mode to read X-Forwarded-* headers
   * - true: trust all proxies
   * - false: don't trust any proxies (default)
   * - number: trust the nth hop from the front-facing proxy
   * - string: trust specific IP address or CIDR range
   * - string[]: trust multiple IPs or CIDR ranges
   */
  trustProxy?: boolean | number | string | string[];

  /**
   * Custom header name to read IP from
   * @default 'x-forwarded-for'
   */
  ipHeader?: string;
}

/**
 * Check if an IP address is in a CIDR range
 */
function isInCidrRange(ip: string, cidr: string): boolean {
  if (!cidr.includes("/")) {
    return ip === cidr;
  }

  const [range, bits] = cidr.split("/");

  // Guard against invalid CIDR format
  if (!range || !bits) {
    return false;
  }

  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  const rangeNum = range.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Check if IP should be trusted based on trust proxy configuration
 */
function shouldTrustProxy(ip: string, trustProxy: boolean | number | string | string[]): boolean {
  if (trustProxy === true) return true;
  if (trustProxy === false) return false;

  if (typeof trustProxy === "string") {
    return isInCidrRange(ip, trustProxy);
  }

  if (Array.isArray(trustProxy)) {
    return trustProxy.some((range) => isInCidrRange(ip, range));
  }

  return false;
}

/**
 * Resolve client IP address from request
 * Handles proxies, load balancers, and direct connections
 *
 * @param req - HTTP request object
 * @param config - IP resolver configuration
 * @returns Object containing primary IP and array of all IPs
 *
 * @example
 * ```typescript
 * // Don't trust proxies (default)
 * const { ip, ips } = resolveIp(req);
 *
 * // Trust all proxies
 * const { ip, ips } = resolveIp(req, { trustProxy: true });
 *
 * // Trust specific proxy
 * const { ip, ips } = resolveIp(req, { trustProxy: '10.0.0.1' });
 *
 * // Trust CIDR range
 * const { ip, ips } = resolveIp(req, { trustProxy: ['10.0.0.0/8', '172.16.0.0/12'] });
 *
 * // Trust first N hops
 * const { ip, ips } = resolveIp(req, { trustProxy: 2 });
 *
 * // Use custom header
 * const { ip, ips } = resolveIp(req, {
 *   trustProxy: true,
 *   ipHeader: 'cf-connecting-ip'
 * });
 * ```
 */
export function resolveIp(
  req: IncomingMessage,
  config: IpResolverConfig = {}
): { ip: string; ips: string[] } {
  const { trustProxy = false, ipHeader = "x-forwarded-for" } = config;

  // Get socket IP as fallback
  // Clean up IPv6 localhost and IPv4-mapped addresses
  let socketIp = req.socket?.remoteAddress || "";
  if (socketIp === "::1" || socketIp === "::ffff:127.0.0.1") {
    socketIp = "127.0.0.1";
  } else if (socketIp.startsWith("::ffff:")) {
    socketIp = socketIp.substring(7);
  }

  // If not trusting proxy, return socket IP only
  if (trustProxy === false) {
    return {
      ip: socketIp,
      ips: socketIp ? [socketIp] : [],
    };
  }

  // Try to get forwarded IPs from headers
  const forwardedHeader = req.headers[ipHeader.toLowerCase()];
  const forwardedFor = Array.isArray(forwardedHeader) ? forwardedHeader[0] : forwardedHeader;

  if (!forwardedFor) {
    return {
      ip: socketIp,
      ips: socketIp ? [socketIp] : [],
    };
  }

  // Parse all IPs from the header
  const allIps = forwardedFor
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  // Add socket IP to the chain
  if (socketIp) {
    allIps.push(socketIp);
  }

  // If trusting all proxies, return first IP
  if (trustProxy === true) {
    return {
      ip: allIps[0] || socketIp || "",
      ips: allIps,
    };
  }

  // If trust proxy is a number, trust that many hops
  if (typeof trustProxy === "number") {
    const hopCount = Math.max(0, trustProxy);
    const trustedIndex = Math.max(0, allIps.length - hopCount - 1);
    return {
      ip: allIps[trustedIndex] || socketIp || "",
      ips: allIps,
    };
  }

  // If trust proxy is IP/CIDR, validate chain
  const trustedIps: string[] = [];
  for (let i = allIps.length - 1; i >= 0; i--) {
    const currentIp = allIps[i];

    if (!currentIp) {
      continue;
    }

    if (shouldTrustProxy(currentIp, trustProxy)) {
      continue;
    }

    // Found first untrusted IP (client IP)
    return {
      ip: currentIp,
      ips: allIps,
    };
  }

  // All IPs were trusted, return first one
  return {
    ip: allIps[0] || socketIp || "",
    ips: allIps,
  };
}

/**
 * Common proxy IP ranges for convenience
 */
export const COMMON_PROXY_RANGES = {
  /** Private network ranges (RFC 1918) */
  PRIVATE: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],

  /** Loopback addresses */
  LOOPBACK: ["127.0.0.0/8", "::1/128"],

  /** Link-local addresses */
  LINK_LOCAL: ["169.254.0.0/16", "fe80::/10"],

  /** Cloudflare IP ranges (example - should be updated regularly) */
  CLOUDFLARE: [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
  ],

  /** AWS ELB IP ranges (example - should be updated regularly) */
  AWS_ELB: ["52.94.76.0/22", "35.180.0.0/16"],
};
