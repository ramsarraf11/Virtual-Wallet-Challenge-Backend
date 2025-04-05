const { rateLimit } = require('express-rate-limit');
const Redis = require('ioredis');
const { RedisStore } = require('rate-limit-redis');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      error: options.message
    });
  }
});

const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 60 * 1000,
  max: 3000,
  keyGenerator: (req) => req.ip + req.body.email,
  message: 'Too many login attempts, please try again later'
});

const walletOperationLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 5 * 60 * 1000,
  max: 3000,
  keyGenerator: (req) => req.user.id,
  message: 'Too many wallet operations, please slow down'
});

const clearAllRateLimits = async () => {
  await redisClient.flushdb();
  console.log('All Redis rate limit data cleared');
};

module.exports = {
  apiLimiter,
  authLimiter,
  walletOperationLimiter,
  clearAllRateLimits
};