interface Entry { timestamps: number[] }
const store = new Map<string, Entry>();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 3600000;
    for (const [k,e] of store) if (e.timestamps.every(t=>t<cutoff)) store.delete(k);
  }, 600000).unref?.();
}
export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterMs: number };
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now(), windowStart = now - windowMs;
  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter(t => t > windowStart);
  if (entry.timestamps.length >= limit) {
    const resetAt = entry.timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt, retryAfterMs: resetAt - now };
  }
  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true, remaining: limit - entry.timestamps.length, resetAt: now + windowMs };
}
export function getClientIP(headers: Headers): string {
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
export const LIMITS = {
  adminLogin:  { limit: 8,   windowMs: 600000  },
  orderCreate: { limit: 10,  windowMs: 3600000 },
  contact:     { limit: 5,   windowMs: 1800000 },
  newsletter:  { limit: 5,   windowMs: 1800000 },
  webhook:     { limit: 100, windowMs: 60000   },
} as const;
