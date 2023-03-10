const Redis = require('ioredis');
const { promisify } = require('util');
const logger = require('./logger');

const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

const redisMiddleware = async (req, res, next) => {
  const cacheKey = req.originalUrl;

  try {
    const getCache = promisify(redisClient.get).bind(redisClient);
    const cache = await getCache(cacheKey);
    if (cache) {
      return res.status(200).send(JSON.parse(cache));
    }

    return next();
  } catch (err) {
    logger.error(`Redis not connected: ${err}`);
    return next();
  }
};

module.exports = { redisClient, redisMiddleware };
