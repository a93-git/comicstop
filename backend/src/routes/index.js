import express from 'express';
import authRoutes from './auth.js';
import comicRoutes from './comics.js';
import { seriesRoutes } from './series.js';
import { creatorProfileRoutes } from './creatorProfile.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/comics', comicRoutes);
router.use('/series', seriesRoutes);
router.use('/creator-profile', creatorProfileRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ComicStop API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;