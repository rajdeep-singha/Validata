import dotenv from 'dotenv';
dotenv.config();

// Pass connection options object — BullMQ uses its own bundled ioredis internally,
// so we avoid type conflicts by providing a plain options object.
export const redisConnection = {
  host: (() => {
    try {
      return new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname;
    } catch { return 'localhost'; }
  })(),
  port: (() => {
    try {
      return parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379', 10);
    } catch { return 6379; }
  })(),
  password: (() => {
    try {
      const u = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
      return u.password || undefined;
    } catch { return undefined; }
  })(),
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
  lazyConnect: true,          // don't connect until first command — prevents crash on startup
  retryStrategy: (times: number) => Math.min(times * 500, 5000),
};
