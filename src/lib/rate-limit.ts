// Cheap per-IP limit: 20 requests per 10 minutes, kept in memory per server instance.
const hits = new Map<string, { count: number; reset: number }>();

export function limited(request: Request, max = 20, windowMs = 10 * 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  return ++h.count > max;
}
