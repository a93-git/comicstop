import { Comment } from '../models/Comment.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/validation.js';

/**
 * Add a new comment to a chapter
 * POST /comments/:chapterId
 */
export const addComment = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { author, text, parentCommentId } = req.body;

  // Sanitize text input
  const sanitizedText = sanitizeText(text);

  // Check if parent comment exists if parentCommentId is provided
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new AppError('Parent comment not found', 404, 'PARENT_COMMENT_NOT_FOUND');
    }
    
    // Verify parent comment belongs to the same chapter
    if (parentComment.chapterId !== chapterId) {
      throw new AppError('Parent comment does not belong to this chapter', 400, 'INVALID_PARENT_COMMENT');
    }
  }

  // Create new comment
  const comment = new Comment({
    chapterId,
    author: sanitizeText(author),
    text: sanitizedText,
    parentCommentId: parentCommentId || null,
  });

  await comment.save();

  // Populate replies for response
  await comment.populate('replies');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      comment,
    },
  });
});

/**
 * Get all comments for a chapter
 * GET /comments/:chapterId
 */
export const getComments = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { sort = 'newest', page = 1, limit = 20 } = req.query;

  // Get total count for pagination
  const total = await Comment.countByChapter(chapterId);

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Get comments with pagination
  let query = Comment.findByChapter(chapterId, sort);
  
  if (page && limit) {
    query = query.skip(skip).limit(parseInt(limit));
  }

  const comments = await query;

  res.json({
    success: true,
    message: 'Comments retrieved successfully',
    data: {
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

/**
 * Like a comment
 * POST /comments/:commentId/like
 */
export const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  await comment.incrementLikes();

  res.json({
    success: true,
    message: 'Comment liked successfully',
    data: {
      commentId: comment._id,
      likes: comment.likes,
    },
  });
});

/**
 * Unlike a comment
 * POST /comments/:commentId/unlike
 */
export const unlikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  await comment.decrementLikes();

  res.json({
    success: true,
    message: 'Comment unliked successfully',
    data: {
      commentId: comment._id,
      likes: comment.likes,
    },
  });
});

/**
 * Add reaction to a comment
 * POST /comments/:commentId/reaction
 */
export const addReaction = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  await comment.addReaction(type);

  res.json({
    success: true,
    message: 'Reaction added successfully',
    data: {
      commentId: comment._id,
      reactions: comment.reactions,
    },
  });
});

/**
 * Remove reaction from a comment
 * DELETE /comments/:commentId/reaction
 */
export const removeReaction = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  await comment.removeReaction(type);

  res.json({
    success: true,
    message: 'Reaction removed successfully',
    data: {
      commentId: comment._id,
      reactions: comment.reactions,
    },
  });
});

/**
 * Delete a comment
 * DELETE /comments/:commentId
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  // Check ownership (should be done by auth middleware)
  // Here we just delete the comment
  
  // Delete all replies first
  await Comment.deleteMany({ parentCommentId: commentId });
  
  // Delete the comment itself
  await Comment.findByIdAndDelete(commentId);

  res.json({
    success: true,
    message: 'Comment deleted successfully',
    data: {
      deletedCommentId: commentId,
    },
  });
});

/**
 * Get comment statistics for a chapter
 * GET /comments/:chapterId/stats
 */
export const getCommentStats = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  const totalComments = await Comment.countByChapter(chapterId);
  const topLevelComments = await Comment.countDocuments({ 
    chapterId, 
    parentCommentId: null 
  });
  const replies = totalComments - topLevelComments;

  // Get most liked comment
  const mostLikedComment = await Comment.findOne({ chapterId })
    .sort({ likes: -1 })
    .limit(1);

  // Get recent activity (comments in last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentComments = await Comment.countDocuments({
    chapterId,
    createdAt: { $gte: oneDayAgo }
  });

  res.json({
    success: true,
    message: 'Comment statistics retrieved successfully',
    data: {
      chapterId,
      totalComments,
      topLevelComments,
      replies,
      recentComments,
      mostLikedComment: mostLikedComment ? {
        id: mostLikedComment._id,
        author: mostLikedComment.author,
        likes: mostLikedComment.likes,
        text: mostLikedComment.text.substring(0, 100) + (mostLikedComment.text.length > 100 ? '...' : ''),
      } : null,
    },
  });
});