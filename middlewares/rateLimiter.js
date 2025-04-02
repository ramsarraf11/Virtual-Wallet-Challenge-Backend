const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const RedisStore = require('rate-limit-redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  headers: true,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      ...options.message,
      rateLimit: {
        limit: options.max,
        remaining: req.rateLimit.remaining,
        reset: new Date(Date.now() + options.windowMs)
      }
    });
  }
});

const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return req.ip + req.body.email;
  }
});

const walletOperationLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 5 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    return req.user.id;
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  walletOperationLimiter
};