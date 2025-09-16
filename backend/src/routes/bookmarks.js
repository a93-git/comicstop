import express from 'express';
import { BookmarkController } from '../controllers/bookmarkController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Bookmark:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         itemId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [comic, series, page]
 *         metadata:
 *           type: object
 *         userId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// All bookmark routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get user's bookmarks
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [comic, series, page]
 *         description: Filter by bookmark type
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
 *     responses:
 *       200:
 *         description: Bookmarks retrieved successfully
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
 *                     bookmarks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bookmark'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', BookmarkController.getBookmarks);

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Add a new bookmark
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [comic, series, page]
 *                 default: comic
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Bookmark added successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Item not found
 *       409:
 *         description: Bookmark already exists
 */
router.post('/', BookmarkController.addBookmark);

/**
 * @swagger
 * /bookmarks/toggle:
 *   post:
 *     summary: Toggle bookmark (add/remove)
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [comic, series, page]
 *                 default: comic
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Item not found
 */
router.post('/toggle', BookmarkController.toggleBookmark);

/**
 * @swagger
 * /bookmarks/check:
 *   get:
 *     summary: Check if an item is bookmarked
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the item to check
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [comic, series, page]
 *           default: comic
 *         description: Type of the item
 *     responses:
 *       200:
 *         description: Bookmark status retrieved
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
 *                     bookmarked:
 *                       type: boolean
 *                     bookmark:
 *                       $ref: '#/components/schemas/Bookmark'
 *       400:
 *         description: Invalid request data
 */
router.get('/check', BookmarkController.checkBookmark);

/**
 * @swagger
 * /bookmarks/{id}:
 *   delete:
 *     summary: Remove a bookmark
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *       404:
 *         description: Bookmark not found
 */
router.delete('/:id', BookmarkController.removeBookmark);

export default router;