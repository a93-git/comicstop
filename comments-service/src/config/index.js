import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/comicstop_comments',
    options: {
      // Modern MongoDB driver doesn't need these options
    },
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS configuration
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.BACKEND_URL || 'http://localhost:3001',
      'http://localhost:3000', // Additional dev URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
};