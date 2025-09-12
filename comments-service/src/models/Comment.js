import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Reaction sub-schema for comment reactions
 */
const reactionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['👍', '❤️', '😂', '😮', '😢', '😡'],
  },
  count: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

/**
 * Comment schema
 */
const commentSchema = new Schema({
  chapterId: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  reactions: [reactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { updatedAt: 'updatedAt' }, // Automatically update updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

/**
 * Virtual for getting replies to this comment
 */
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
  options: { sort: { createdAt: 1 } }, // Sort replies by oldest first
});

/**
 * Index for efficient querying
 */
commentSchema.index({ chapterId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: 1 });

/**
 * Instance methods
 */
commentSchema.methods.addReaction = function(reactionType) {
  const existingReaction = this.reactions.find(r => r.type === reactionType);
  
  if (existingReaction) {
    existingReaction.count += 1;
  } else {
    this.reactions.push({ type: reactionType, count: 1 });
  }
  
  return this.save();
};

commentSchema.methods.removeReaction = function(reactionType) {
  const existingReaction = this.reactions.find(r => r.type === reactionType);
  
  if (existingReaction && existingReaction.count > 0) {
    existingReaction.count -= 1;
    
    // Remove reaction if count reaches 0
    if (existingReaction.count === 0) {
      this.reactions = this.reactions.filter(r => r.type !== reactionType);
    }
  }
  
  return this.save();
};

commentSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

commentSchema.methods.decrementLikes = function() {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

/**
 * Static methods
 */
commentSchema.statics.findByChapter = function(chapterId, sortBy = 'newest') {
  let sortOption;
  
  switch (sortBy) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'most_liked':
      sortOption = { likes: -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }
  
  return this.find({ chapterId, parentCommentId: null })
    .sort(sortOption)
    .populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } },
      populate: {
        path: 'replies',
        options: { sort: { createdAt: 1 } },
      },
    });
};

commentSchema.statics.countByChapter = function(chapterId) {
  return this.countDocuments({ chapterId });
};

/**
 * Pre-save middleware
 */
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Comment = mongoose.model('Comment', commentSchema);