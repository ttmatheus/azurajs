import { HttpError } from "./utils/HttpError";
import { Node, type Handler } from "./utils/route/Node";

interface MatchResult {
  handlers: Handler[];
  params: Record<string, string>;
}

export class Router {
  private root = new Node();

  add(method: string, path: string, ...handlers: Handler[]) {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;

    for (const seg of segments) {
      let child: Node;

      if (seg.startsWith(":")) {
        child = new Node();
        child.isParam = true;
        child.paramName = seg.slice(1);
      } else {
        child = node.children.get(seg) ?? new Node();
      }

      node.children.set(seg.startsWith(":") ? ":" : seg, child);
      node = child;
    }

    node.handlers.set(method.toUpperCase(), handlers);
  }

  find(method: string, path: string): MatchResult {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;
    const params: Record<string, string> = {};
    
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      let child = node.children.get(seg);
      
      if (child) {
        node = child;
      } else {
        child = node.children.get(":");
        if (child) {
          node = child;
          if (node.paramName) {
            params[node.paramName] = seg;
          }
        } else {
          throw new HttpError(404, "Route not found");
        }
      }
    }

    const handlers = node.handlers.get(method.toUpperCase()) as Handler[];
    if (!handlers) {
      throw new HttpError(404, "Route not found");
    }
    return { handlers, params };
  }
}
