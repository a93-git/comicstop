import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './src/config/index.js';
import { connectDatabase } from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import commentsRoutes from './src/routes/comments.js';

/**
 * Create Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/**
 * CORS configuration
 */
app.use(cors(config.cors));

/**
 * Rate limiting
 */
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/**
 * Request logging
 */
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Comments service is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ComicStop Comments Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      comments: '/comments/:chapterId',
      addComment: 'POST /comments/:chapterId',
      likeComment: 'POST /comments/:commentId/like',
      addReaction: 'POST /comments/:commentId/reaction',
      deleteComment: 'DELETE /comments/:commentId',
      stats: '/comments/:chapterId/stats',
    },
    documentation: {
      swagger: 'Coming soon',
      github: 'https://github.com/a93-git/comicstop',
    },
  });
});

/**
 * API routes
 */
app.use('/comments', commentsRoutes);

/**
 * Error handling middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Try to connect to MongoDB (but don't fail if it doesn't work)
    console.log('🔌 Attempting to connect to MongoDB...');
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      console.warn('⚠️  MongoDB connection failed. The server will start but database features will not work.');
      console.warn('⚠️  To enable database features, ensure MongoDB is running and connection string is correct.');
    }

    // Start HTTP server regardless of database connection
    const server = app.listen(config.port, () => {
      console.log(`🚀 ComicStop Comments Service running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📍 Base URL: http://localhost:${config.port}`);
      
      if (config.nodeEnv === 'development') {
        console.log(`🔍 Health Check: http://localhost:${config.port}/health`);
        console.log(`💬 API Endpoints: http://localhost:${config.port}/`);
      }
      
      if (!dbConnected) {
        console.log(`⚠️  Note: Database not connected. Some endpoints may not work.`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('💤 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('💤 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;