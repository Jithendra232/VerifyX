const buckets = new Map();

const rateLimit = ({ windowMs = 60 * 1000, max = 60 } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl.split("?")[0]}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again shortly.",
      });
    }

    next();
  };
};

module.exports = rateLimit;
