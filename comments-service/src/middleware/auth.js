import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * JWT Authentication middleware
 * Compatible with the main ComicStop app's authentication system
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      code: 'MISSING_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
};

/**
 * Optional authentication middleware
 * Allows requests without token but populates user if token is present
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch {
    // Don't fail on invalid token, just set user to null
    req.user = null;
  }

  next();
};

/**
 * Check if user is authenticated
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }
  next();
};

/**
 * Check if user owns the resource or is admin
 */
export const checkOwnership = (req, res, next) => {
  const { author } = req.body;
  const userFromToken = req.user?.username || req.user?.email;

  // Allow if user is admin or owns the resource
  if (req.user?.role === 'admin' || userFromToken === author) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions',
    code: 'INSUFFICIENT_PERMISSIONS',
  });
};

/**
 * Extract user info for comment creation
 */
export const extractUserInfo = (req, res, next) => {
  // If authenticated, use user info from token
  if (req.user) {
    req.body.author = req.user.username || req.user.email || req.body.author;
  }
  
  // For now, allow anonymous comments if no auth
  // This can be made stricter by requiring authentication
  next();
};