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
    const isMulti = Array.isArray(req.files);
    if (!req.file && !isMulti) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (isMulti) {
      const { uploadId, pageOrder, uploads } = await ComicService.uploadImages(
        req.files,
        req.user.id
      );
      return res.status(201).json({
        success: true,
        message: 'Images uploaded successfully',
        data: { uploadId, pageOrder, uploads },
      });
    }

    const comic = await ComicService.uploadComic(
      req.file,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Comic uploaded successfully',
      data: { comic },
    });
  });

  /**
   * Create a comic record from prior upload(s)
   * POST /comics
   */
  static create = asyncHandler(async (req, res) => {
    const comic = await ComicService.createComic(req.body, req.user.id, req.file);
    res.status(201).json({ success: true, message: 'Comic created', data: { comic } });
  });

  /**
   * Patch metadata or publish
   * PATCH /comics/:id
   */
  static patch = asyncHandler(async (req, res) => {
    const comic = await ComicService.patchComic(req.params.id, req.body, req.user.id, req.file);
    res.json({ success: true, message: 'Comic updated', data: { comic } });
  });

  /**
   * Get draft preview data
   * GET /comics/:id/preview
   */
  static preview = asyncHandler(async (req, res) => {
    const data = await ComicService.getDraftPreview(req.params.id, req.user.id);
    res.json({ success: true, data });
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