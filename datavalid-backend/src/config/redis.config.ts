import dotenv from 'dotenv';
dotenv.config();

// Pass connection options object — BullMQ uses its own bundled ioredis internally,
// so we avoid type conflicts by providing a plain options object.
const parsedUrl = (() => {
  try { return new URL(process.env.REDIS_URL || 'redis://localhost:6379'); }
  catch { return new URL('redis://localhost:6379'); }
})();

export const redisConnection = {
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port || '6379', 10),
  password: parsedUrl.password || undefined,
  tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times: number) => Math.min(times * 500, 5000),
};
