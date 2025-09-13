import express from 'express';
import { SeriesController } from '../controllers/seriesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', SeriesController.getSeries);
router.get('/:id', SeriesController.getSeriesById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Creator routes
router.post('/', upload.single('coverArt'), SeriesController.createSeries);
router.put('/:id', upload.single('coverArt'), SeriesController.updateSeries);
router.delete('/:id', SeriesController.deleteSeries);
router.get('/my/series', SeriesController.getCreatorSeries);
router.post('/:id/reorder-comics', SeriesController.reorderComics);

export { router as seriesRoutes };