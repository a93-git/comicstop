import express from 'express';
import {
  addComment,
  getComments,
  likeComment,
  unlikeComment,
  addReaction,
  removeReaction,
  deleteComment,
  getCommentStats,
} from '../controllers/commentsController.js';
import {
  optionalAuth,
  extractUserInfo,
  requireAuth,
} from '../middleware/auth.js';
import {
  validate,
  schemas,
} from '../utils/validation.js';

const router = express.Router();

/**
 * @route   GET /comments/:chapterId
 * @desc    Get all comments for a chapter
 * @access  Public
 */
router.get(
  '/:chapterId',
  validate(schemas.chapterId, 'params'),
  validate(schemas.queryParams, 'query'),
  getComments
);

/**
 * @route   POST /comments/:chapterId
 * @desc    Add a new comment to a chapter
 * @access  Public (but can use auth for user info)
 */
router.post(
  '/:chapterId',
  validate(schemas.chapterId, 'params'),
  optionalAuth,
  extractUserInfo,
  validate(schemas.addComment, 'body'),
  addComment
);

/**
 * @route   GET /comments/:chapterId/stats
 * @desc    Get comment statistics for a chapter
 * @access  Public
 */
router.get(
  '/:chapterId/stats',
  validate(schemas.chapterId, 'params'),
  getCommentStats
);

/**
 * @route   POST /comments/:commentId/like
 * @desc    Like a comment
 * @access  Public
 */
router.post(
  '/:commentId/like',
  validate(schemas.commentId, 'params'),
  likeComment
);

/**
 * @route   POST /comments/:commentId/unlike
 * @desc    Unlike a comment
 * @access  Public
 */
router.post(
  '/:commentId/unlike',
  validate(schemas.commentId, 'params'),
  unlikeComment
);

/**
 * @route   POST /comments/:commentId/reaction
 * @desc    Add reaction to a comment
 * @access  Public
 */
router.post(
  '/:commentId/reaction',
  validate(schemas.commentId, 'params'),
  validate(schemas.reaction, 'body'),
  addReaction
);

/**
 * @route   DELETE /comments/:commentId/reaction
 * @desc    Remove reaction from a comment
 * @access  Public
 */
router.delete(
  '/:commentId/reaction',
  validate(schemas.commentId, 'params'),
  validate(schemas.reaction, 'body'),
  removeReaction
);

/**
 * @route   DELETE /comments/:commentId
 * @desc    Delete a comment
 * @access  Private (Author or Admin only)
 */
router.delete(
  '/:commentId',
  validate(schemas.commentId, 'params'),
  requireAuth, // Require authentication for deletion
  deleteComment
);

export default router;