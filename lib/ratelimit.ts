import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback for development (no Redis required)
class InMemoryRatelimit {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(private maxRequests: number, private windowMs: number) {}

  async limit(identifier: string) {
    const now = Date.now();
    const key = identifier;
    const data = this.store.get(key);

    if (!data || now > data.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    data.count++;
    this.store.set(key, data);

    return {
      success: data.count <= this.maxRequests,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - data.count),
      reset: data.resetAt,
    };
  }
}

// Try to use Upstash Redis, fallback to in-memory
const createRatelimiter = () => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    });
  }

  // Development fallback
  return new InMemoryRatelimit(10, 10 * 1000);
};

export const ratelimit = createRatelimiter();

// Endpoint-specific rate limiters
export const strictRatelimit = new InMemoryRatelimit(5, 60 * 1000); // 5 per minute
export const authRatelimit = new InMemoryRatelimit(3, 60 * 1000); // 3 per minute
