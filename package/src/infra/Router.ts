import type { RequestHandler } from "../types";
import { HttpError } from "./utils/HttpError";
import { Node, type Handler } from "./utils/route/Node";

interface MatchResult {
  handlers: Handler[];
  params: Record<string, string>;
}

export class Router {
  private root = new Node();
  private debug?: boolean;
  private middlewares: RequestHandler[] = [];

  constructor(debug = false) {
    this.debug = debug;
  }

  add(method: string, path: string, ...handlers: Handler[]) {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;

    if (this.debug) {
      console.log(`[Router:DEBUG] Adding ${method} ${path}`);
      console.log(`[Router:DEBUG] Segments:`, segments);
    }

    for (const seg of segments) {
      let child: Node;

      if (seg.startsWith(":")) {
        const paramKey = ":";
        child = node.children.get(paramKey);
        
        if (!child) {
          child = new Node();
          child.isParam = true;
          child.paramName = seg.slice(1);
          node.children.set(paramKey, child);
          
          if (this.debug) {
            console.log(`[Router:DEBUG] Created param node: :${seg.slice(1)}`);
          }
        } else {
          // Update paramName if it's different (shouldn't happen in normal usage)
          if (child.paramName !== seg.slice(1)) {
            if (this.debug) {
              console.warn(`[Router:DEBUG] Warning: Param name mismatch at "${seg}". Previous: ":${child.paramName}", New: ":${seg.slice(1)}"`);
            }
          }
        }
      } else {
        child = node.children.get(seg);
        
        if (!child) {
          child = new Node();
          node.children.set(seg, child);
          
          if (this.debug) {
            console.log(`[Router:DEBUG] Created literal node: "${seg}"`);
          }
        }
      }

      node = child;
    }

    if (this.debug) {
      console.log(`[Router:DEBUG] Setting handler for ${method} at final node`);
    }

    node.handlers.set(method.toUpperCase(), handlers);
  }

  find(method: string, path: string): MatchResult {
    const cleanPath = path.split("?")[0] || "/";
    const segments = cleanPath === "/" ? [] : cleanPath.split("/").filter(Boolean);
    let node = this.root;
    const params: Record<string, string> = {};

    if (this.debug) {
      console.log(`[Router:DEBUG] Finding ${method} ${cleanPath}`);
      console.log(`[Router:DEBUG] Segments:`, segments);
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!seg) continue;

      let child = node.children.get(seg);

      if (child) {
        node = child;
        if (this.debug) {
          console.log(`[Router:DEBUG] Matched literal segment: "${seg}"`);
        }
      } else {
        child = node.children.get(":");
        if (child) {
          node = child;
          if (node.paramName) {
            params[node.paramName] = seg;
            if (this.debug) {
              console.log(`[Router:DEBUG] Matched param segment: ":${node.paramName}" = "${seg}"`);
            }
          } else if (this.debug) {
            console.warn(`[Router:DEBUG] Warning: Param node found but paramName is undefined!`);
          }
        } else {
          if (this.debug) {
            console.error(`[Router:DEBUG] Route not found for ${method} ${cleanPath}`);
            console.error(`[Router:DEBUG] Failed at segment: "${seg}"`);
            console.error(`[Router:DEBUG] Available children:`, Array.from(node.children.keys()));
          }
          throw new HttpError(404, "Route not found");
        }
      }
    }

    const handlers = node.handlers.get(method.toUpperCase()) as Handler[];
    if (!handlers) {
      if (this.debug) {
        console.error(
          `[Router:DEBUG] No handlers for method ${method.toUpperCase()} at path ${cleanPath}`
        );
        console.error(
          `[Router:DEBUG] Available methods at this path:`,
          Array.from(node.handlers.keys())
        );
        console.error(`[Router:DEBUG] Segments matched:`, segments);
      }
      throw new HttpError(404, "Route not found");
    }
    
    if (this.debug) {
      console.log(`[Router:DEBUG] Found handlers for ${method} ${cleanPath}`);
      console.log(`[Router:DEBUG] Extracted params:`, params);
    }
    
    return { handlers, params };
  }

  public listRoutes(): Array<{ method: string; path: string }> {
    const routes: Array<{ method: string; path: string }> = [];

    const traverse = (node: Node, path: string) => {
      if (node.handlers.size > 0) {
        for (const method of node.handlers.keys()) {
          routes.push({ method, path: path || "/" });
        }
      }

      for (const [segment, child] of node.children) {
        const newPath =
          path + "/" + (segment === ":" && child.paramName ? `:${child.paramName}` : segment);
        traverse(child, newPath);
      }
    };

    traverse(this.root, "");
    return routes;
  }

  public use(mw: RequestHandler): void;
  public use(prefix: string, router: Router): void;
  public use(prefixOrMw: string | RequestHandler, router?: Router): void {
    if (typeof prefixOrMw === "function") {
      this.middlewares.push(prefixOrMw);
    } else if (typeof prefixOrMw === "string" && router instanceof Router) {
      const prefix = prefixOrMw.endsWith("/") ? prefixOrMw.slice(0, -1) : prefixOrMw;
      const routes = router.listRoutes();

      for (const route of routes) {
        const fullPath = prefix + (route.path === "/" ? "" : route.path);
        const { handlers } = router.find(route.method, route.path);
        this.add(route.method, fullPath, ...handlers);
      }
    }
  }
}
