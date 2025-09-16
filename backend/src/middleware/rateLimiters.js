import rateLimit from 'express-rate-limit'

// Shared options for consistent JSON responses
const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  keyGenerator: (req) => {
    // In tests, allow overriding the key to isolate cases
    const testKey = req.get('X-Test-Key') || req.get('x-test-key')
    return testKey || req.ip
  },
}

// Helper to set higher limits during generic tests unless a test key is provided
function dynamicMax(defaultMax) {
  return (req, _res) => {
    const hasTestKey = Boolean(req.get('X-Test-Key') || req.get('x-test-key'))
    if (hasTestKey) return defaultMax
    if (process.env.NODE_ENV === 'test') return 1000 // effectively disabled for non-keyed test traffic
    return defaultMax
  }
}

export const loginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: dynamicMax(5), // allow 5 attempts per 10 minutes per key/IP
})

export const signupLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: dynamicMax(3), // allow 3 signups per hour per key/IP
})

export const forgotPasswordLimiter = rateLimit({
  ...baseOptions,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: dynamicMax(3), // allow 3 requests per 30 minutes per key/IP
})
