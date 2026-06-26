import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 20 reflections per user per day
export const reflectionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '24 h'),
  prefix: 'gherkin:reflection',
});

// 5 pattern surfacing requests per user per day
export const patternLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'),
  prefix: 'gherkin:pattern',
});

// 50 card draws per user per day
export const drawLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '24 h'),
  prefix: 'gherkin:draw',
});
