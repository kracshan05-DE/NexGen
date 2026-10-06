/**
 * Sliding-window rate limiter held in process memory.
 *
 * Scope and limits, stated plainly: on a serverless host each warm instance
 * keeps its own counters, so this stops a single client hammering the form
 * but is not a hard global cap. That is the right cost/benefit for a contact
 * form. If abuse appears, add Cloudflare Turnstile or a shared store (Upstash)
 * rather than tightening this.
 */
type Options = { limit: number; windowMs: number };

const MAX_TRACKED_KEYS = 5_000;
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit, windowMs }: Options,
  now: number = Date.now(),
): { allowed: boolean; remaining: number } {
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bound memory: drop the oldest keys once the table gets large.
  if (hits.size > MAX_TRACKED_KEYS) {
    const overflow = hits.size - MAX_TRACKED_KEYS;
    let removed = 0;
    for (const k of hits.keys()) {
      hits.delete(k);
      if (++removed >= overflow) break;
    }
  }

  return { allowed: true, remaining: limit - recent.length };
}

/** Test helper. */
export function resetRateLimit(): void {
  hits.clear();
}
