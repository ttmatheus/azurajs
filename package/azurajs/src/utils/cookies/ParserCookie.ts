export function parseCookiesHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, pair) => {
    const [k, ...vals] = pair.trim().split("=");
    if (!k) return acc;
    acc[k] = decodeURIComponent(vals.join("="));
    return acc;
  }, {});
}
