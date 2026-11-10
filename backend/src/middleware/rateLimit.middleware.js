// Rate Limiting Middleware - Enterprise Brute-Force Defense
// Implements an in-memory sliding window algorithm tracking client IP and endpoint attempts
// Policy: Max 10 login attempts per 15 minutes (900,000 ms)

export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxAttempts = options.max || 10; // 10 attempts
  const message =
    options.message ||
    'Security Alert: Too many login attempts. Access temporarily suspended to prevent brute-force attacks.';

  // Map stores: key (IP address) -> array of timestamps [t1, t2, ...]
  const ipAttempts = new Map();

  // Periodic cleanup of expired entries every 5 minutes to prevent memory accumulation
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipAttempts.entries()) {
      const validTimestamps = timestamps.filter((time) => now - time < windowMs);
      if (validTimestamps.length === 0) {
        ipAttempts.delete(ip);
      } else {
        ipAttempts.set(ip, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    // Detect real client IP behind reverse proxies (Render, Cloudflare, etc.)
    const rawForwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (rawForwarded && typeof rawForwarded === 'string' ? rawForwarded.split(',')[0].trim() : null) ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const timestamps = ipAttempts.get(clientIp) || [];

    // Filter out attempts outside the current sliding window
    const recentAttempts = timestamps.filter((time) => now - time < windowMs);

    // Set standard rate-limit response headers
    res.setHeader('X-RateLimit-Limit', maxAttempts);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - recentAttempts.length));

    if (recentAttempts.length >= maxAttempts) {
      // Calculate earliest timestamp to compute exact retry-after in seconds
      const oldestAttempt = recentAttempts[0];
      const resetTimeMs = oldestAttempt + windowMs;
      const retryAfterSeconds = Math.ceil((resetTimeMs - now) / 1000);

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTimeMs / 1000));

      return res.status(429).json({
        success: false,
        status: 429,
        field: 'rateLimit',
        message: `${message} Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
        retryAfter: retryAfterSeconds,
      });
    }

    // Record this attempt
    recentAttempts.push(now);
    ipAttempts.set(clientIp, recentAttempts);

    next();
  };
};

// Pre-configured login rate limiter: 15 minutes, 10 attempts
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Security Alert: Account login rate limit exceeded (10 attempts / 15 mins).',
});
