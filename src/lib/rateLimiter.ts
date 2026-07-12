import { RateLimiterMemory } from 'rate-limiter-flexible';
export const globalLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1, 
});
export async function checkRateLimit(ip: string) {
  try {
    await globalLimiter.consume(ip);
    return true;
  } catch (rejRes) {
    return false;
  }
}