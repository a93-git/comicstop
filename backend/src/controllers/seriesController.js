import { SeriesService } from '../services/seriesService.js';
import { validateSeriesData, validateSeriesUpdate } from '../middleware/validation.js';

/**
 * Series controller for handling series-related requests
 */
export class SeriesController {
  /**
   * Create a new series
   */
  static async createSeries(req, res) {
    try {
      const { error } = validateSeriesData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
      }

      const creatorId = req.user.id;
      const coverArtFile = req.file;

      const series = await SeriesService.createSeries(req.body, creatorId, coverArtFile);

      res.status(201).json({
        success: true,
        message: 'Series created successfully',
        data: {
          series,
        },
      });
    } catch (error) {
      console.error('Create series error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create series',
        error: error.message,
      });
    }
  }

  /**
   * Get all series with pagination and filtering
   */
  static async getSeries(req, res) {
    try {
      const result = await SeriesService.getSeries(req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get series error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch series',
        error: error.message,
      });
    }
  }

  /**
   * Get a specific series by ID
   */
  static async getSeriesById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const series = await SeriesService.getSeriesById(id, userId);

      res.json({
        success: true,
        data: {
          series,
        },
      });
    } catch (error) {
      console.error('Get series by ID error:', error);
      const statusCode = error.message === 'Series not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update series
   */
  static async updateSeries(req, res) {
    try {
      const { error } = validateSeriesUpdate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const coverArtFile = req.file;

      const series = await SeriesService.updateSeries(id, req.body, userId, coverArtFile);

      res.json({
        success: true,
        message: 'Series updated successfully',
        data: {
          series,
        },
      });
    } catch (error) {
      console.error('Update series error:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete series
   */
  static async deleteSeries(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await SeriesService.deleteSeries(id, userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete series error:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get creator's series
   */
  static async getCreatorSeries(req, res) {
    try {
      const creatorId = req.user.id;
      const result = await SeriesService.getCreatorSeries(creatorId, req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get creator series error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch creator series',
        error: error.message,
      });
    }
  }

  /**
   * Reorder comics in a series
   */
  static async reorderComics(req, res) {
    try {
      const { id } = req.params;
      const { comics } = req.body;
      const userId = req.user.id;

      if (!comics || !Array.isArray(comics)) {
        return res.status(400).json({
          success: false,
          message: 'Comics array is required',
        });
      }

      const result = await SeriesService.reorderComics(id, comics, userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Reorder comics error:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}