import express from 'express';
import { SeriesController } from '../controllers/seriesController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Series:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         coverArtS3Url:
 *           type: string
 *           format: uri
 *         genre:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         ageRating:
 *           type: string
 *           enum: [G, PG, PG-13, R, NC-17]
 *         language:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ongoing, completed, hiatus, cancelled]
 *         isPublic:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         creatorId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SeriesMinimal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *       required: [id, name]
 *     SeriesMinimalResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SeriesMinimal'
 */

// Public routes
// Conditionally require auth when filtering by current user
const conditionalAuthForCurrent = (req, res, next) => {
	if (req.query && req.query.user_id === 'current') {
		return requireAuth(req, res, next);
	}
	return next();
};

/**
 * @swagger
 * /series:
 *   get:
 *     summary: List series
 *     description: |
 *       Returns a list of series. When `user_id=current` is provided, this endpoint returns only the authenticated user's series in a minimal shape and requires a valid bearer token.
 *     tags: [Series]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           enum: [current]
 *         required: false
 *         description: When set to `current`, returns only series created by the current authenticated user. Requires Authorization header.
 *     responses:
 *       200:
 *         description: Successfully fetched series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesMinimalResponse'
 *             examples:
 *               minimalForCurrentUser:
 *                 summary: Minimal response when filtering to current user
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "f2a1c5fa-9b77-4c8d-9d6f-4f3b83a9f1e7"
 *                       name: "My First Series"
 *                     - id: "a3c2b6d8-1234-4a5b-9cde-0123456789ab"
 *                       name: "Side Project Anthology"
 *       401:
 *         description: Unauthorized (when user_id=current is provided without a valid token)
 *       500:
 *         description: Server error
 */
router.get('/', conditionalAuthForCurrent, SeriesController.getSeries);

/**
 * @swagger
 * /series/{id}:
 *   get:
 *     summary: Get a series by ID
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Series fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     series:
 *                       $ref: '#/components/schemas/Series'
 *       404:
 *         description: Series not found
 */
router.get('/:id', SeriesController.getSeriesById);

// Protected routes (require authentication)
router.use(requireAuth);

// Creator routes
/**
 * @swagger
 * /series:
 *   post:
 *     summary: Create a new series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               ageRating:
 *                 type: string
 *                 enum: [G, PG, PG-13, R, NC-17]
 *               language:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus, cancelled]
 *               isPublic:
 *                 type: boolean
 *               coverArt:
 *                 type: string
 *                 format: binary
 *                 description: Optional cover image
 *     responses:
 *       201:
 *         description: Series created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     series:
 *                       $ref: '#/components/schemas/Series'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.single('coverArt'), SeriesController.createSeries);

/**
 * @swagger
 * /series/{id}:
 *   put:
 *     summary: Update a series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               ageRating:
 *                 type: string
 *                 enum: [G, PG, PG-13, R, NC-17]
 *               language:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus, cancelled]
 *               isPublic:
 *                 type: boolean
 *               coverArt:
 *                 type: string
 *                 format: binary
 *                 description: Optional new cover image to upload
 *     responses:
 *       200:
 *         description: Series updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     series:
 *                       $ref: '#/components/schemas/Series'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Series not found or access denied
 */
router.put('/:id', upload.single('coverArt'), SeriesController.updateSeries);

/**
 * @swagger
 * /series/{id}:
 *   delete:
 *     summary: Delete a series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Series deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Series not found or access denied
 */
router.delete('/:id', SeriesController.deleteSeries);
router.get('/my/series', SeriesController.getCreatorSeries);
router.post('/:id/reorder-comics', SeriesController.reorderComics);

export { router as seriesRoutes };