import express from 'express';
import { ComicController } from '../controllers/comicController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, comicSchemas } from '../middleware/validation.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         author:
 *           type: string
 *         publisher:
 *           type: string
 *         publicationDate:
 *           type: string
 *           format: date
 *         genre:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         pageCount:
 *           type: integer
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: integer
 *         fileType:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         downloadCount:
 *           type: integer
 *         viewCount:
 *           type: integer
 *         uploaderId:
 *           type: string
 *           format: uuid
 *         uploader:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ComicList:
 *       type: object
 *       properties:
 *         comics:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comic'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalItems:
 *               type: integer
 *             itemsPerPage:
 *               type: integer
 */

/**
 * @swagger
 * /comics/upload:
 *   post:
 *     summary: Upload a new comic
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - comic
 *               - title
 *             properties:
 *               comic:
 *                 type: string
 *                 format: binary
 *                 description: Comic file (PDF, CBZ, etc.)
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               author:
 *                 type: string
 *                 maxLength: 255
 *               publisher:
 *                 type: string
 *                 maxLength: 255
 *               publicationDate:
 *                 type: string
 *                 format: date
 *               genre:
 *                 type: string
 *                 maxLength: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               pageCount:
 *                 type: integer
 *                 minimum: 1
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Comic uploaded successfully
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
 *                     comic:
 *                       $ref: '#/components/schemas/Comic'
 *       400:
 *         description: Validation error or missing file
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
// Prefer multi-files when header indicates, else single. We register two routes to leverage multer parsers.
router.post('/upload', requireAuth,
  (req, res, next) => {
    if (req.headers['x-upload-multiple'] === 'true') {
      return upload.array('files', 50)(req, res, (err) => handleUploadError(err, req, res, next));
    }
    return upload.single('comic')(req, res, (err) => handleUploadError(err, req, res, next));
  },
  validate(comicSchemas.upload),
  ComicController.upload
);

// Create comic from uploaded file(s)
router.post(
  '/',
  requireAuth,
  // Accept optional cover thumbnail file
  (req, res, next) => upload.single('thumbnailUpload')(req, res, (err) => handleUploadError(err, req, res, next)),
  validate(comicSchemas.create),
  ComicController.create
);

// Update comic metadata or publish
router.patch(
  '/:id',
  requireAuth,
  // Accept optional cover thumbnail file on patch
  (req, res, next) => upload.single('thumbnailUpload')(req, res, (err) => handleUploadError(err, req, res, next)),
  validate(comicSchemas.update),
  ComicController.patch
);

// Draft preview
router.get(
  '/:id/preview',
  requireAuth,
  ComicController.preview
);

/**
 * @swagger
 * /comics:
 *   get:
 *     summary: Get all public comics with pagination and filtering
 *     tags: [Comics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, title, author, rating, viewCount]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Search in title, description, and author
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Filter by author
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter by
 *     responses:
 *       200:
 *         description: Comics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ComicList'
 */
router.get('/', validate(comicSchemas.query, 'query'), ComicController.getComics);

/**
 * @swagger
 * /comics/my:
 *   get:
 *     summary: Get user's own comics
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, title, author, rating, viewCount]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: User comics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ComicList'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', requireAuth, validate(comicSchemas.query, 'query'), ComicController.getMyComics);

/**
 * @swagger
 * /comics/{id}:
 *   get:
 *     summary: Get a specific comic by ID
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comic ID
 *     responses:
 *       200:
 *         description: Comic retrieved successfully
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
 *                     comic:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Comic'
 *                         - type: object
 *                           properties:
 *                             fileUrl:
 *                               type: string
 *                               description: Presigned URL for file access
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Comic not found
 */
router.get('/:id', requireAuth, ComicController.getComicById);

/**
 * @swagger
 * /comics/{id}:
 *   put:
 *     summary: Update comic metadata
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               author:
 *                 type: string
 *                 maxLength: 255
 *               publisher:
 *                 type: string
 *                 maxLength: 255
 *               publicationDate:
 *                 type: string
 *                 format: date
 *               genre:
 *                 type: string
 *                 maxLength: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               pageCount:
 *                 type: integer
 *                 minimum: 1
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Comic updated successfully
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
 *                     comic:
 *                       $ref: '#/components/schemas/Comic'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Comic not found
 */
router.put('/:id', requireAuth, validate(comicSchemas.update), ComicController.updateComic);

/**
 * @swagger
 * /comics/{id}:
 *   delete:
 *     summary: Delete a comic
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comic ID
 *     responses:
 *       200:
 *         description: Comic deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Comic not found
 */
router.delete('/:id', requireAuth, ComicController.deleteComic);

export default router;