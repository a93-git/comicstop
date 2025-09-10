import { ComicService } from '../services/comicService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Comic controller
 */
export class ComicController {
  /**
   * Upload a new comic
   * POST /comics/upload
   */
  static upload = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const comic = await ComicService.uploadComic(
      req.file,
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Comic uploaded successfully',
      data: {
        comic,
      },
    });
  });

  /**
   * Get all comics with pagination and filtering
   * GET /comics
   */
  static getComics = asyncHandler(async (req, res) => {
    const result = await ComicService.getComics(req.query);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Get a specific comic by ID
   * GET /comics/:id
   */
  static getComicById = asyncHandler(async (req, res) => {
    const comic = await ComicService.getComicById(
      req.params.id,
      req.user?.id
    );

    res.json({
      success: true,
      data: {
        comic,
      },
    });
  });

  /**
   * Update comic metadata
   * PUT /comics/:id
   */
  static updateComic = asyncHandler(async (req, res) => {
    const comic = await ComicService.updateComic(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Comic updated successfully',
      data: {
        comic,
      },
    });
  });

  /**
   * Delete a comic
   * DELETE /comics/:id
   */
  static deleteComic = asyncHandler(async (req, res) => {
    const result = await ComicService.deleteComic(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: result.message,
    });
  });

  /**
   * Get user's own comics
   * GET /comics/my
   */
  static getMyComics = asyncHandler(async (req, res) => {
    const result = await ComicService.getUserComics(req.user.id, req.query);

    res.json({
      success: true,
      data: result,
    });
  });
}