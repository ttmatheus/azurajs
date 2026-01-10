export function parseQS(qs: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  if (!qs) return out;
  
  const parts = qs.split("&");
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    
    const idx = p.indexOf("=");
    if (idx === -1) {
      out[decodeURIComponent(p)] = "";
      continue;
    }
    
    const k = decodeURIComponent(p.slice(0, idx));
    const v = decodeURIComponent(p.slice(idx + 1));
    
    const existing = out[k];
    if (existing !== undefined) {
      if (Array.isArray(existing)) {
        existing.push(v);
      } else {
        out[k] = [existing as string, v];
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}
