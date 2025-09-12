import Joi from 'joi';
import mongoose from 'mongoose';

/**
 * Validation schemas
 */
export const schemas = {
  // Add comment validation
  addComment: Joi.object({
    author: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Author name is required',
        'string.min': 'Author name must be at least 1 character long',
        'string.max': 'Author name cannot exceed 100 characters',
      }),
    
    text: Joi.string()
      .trim()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.empty': 'Comment text is required',
        'string.min': 'Comment text must be at least 1 character long',
        'string.max': 'Comment text cannot exceed 2000 characters',
      }),
    
    parentCommentId: Joi.string()
      .optional()
      .custom((value, helpers) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .messages({
        'any.invalid': 'Invalid parent comment ID format',
      }),
  }),

  // Chapter ID validation
  chapterId: Joi.object({
    chapterId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Chapter ID is required',
        'string.min': 'Chapter ID must be at least 1 character long',
        'string.max': 'Chapter ID cannot exceed 100 characters',
      }),
  }),

  // Comment ID validation
  commentId: Joi.object({
    commentId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .messages({
        'any.required': 'Comment ID is required',
        'any.invalid': 'Invalid comment ID format',
      }),
  }),

  // Reaction validation
  reaction: Joi.object({
    type: Joi.string()
      .valid('👍', '❤️', '😂', '😮', '😢', '😡')
      .required()
      .messages({
        'any.only': 'Invalid reaction type. Allowed reactions: 👍, ❤️, 😂, 😮, 😢, 😡',
        'any.required': 'Reaction type is required',
      }),
  }),

  // Query parameters validation
  queryParams: Joi.object({
    sort: Joi.string()
      .valid('newest', 'oldest', 'most_liked')
      .default('newest')
      .messages({
        'any.only': 'Invalid sort option. Allowed values: newest, oldest, most_liked',
      }),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
  }),
};

/**
 * Validation middleware factory
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = property === 'params' ? req.params : 
                 property === 'query' ? req.query : req.body;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Update request with validated data
    if (property === 'params') {
      req.params = value;
    } else if (property === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

/**
 * Custom validation helpers
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeText = (text) => {
  return text.trim().replace(/\s+/g, ' ');
};

export const validateChapterId = (chapterId) => {
  const { error } = schemas.chapterId.validate({ chapterId });
  return !error;
};

export const validateCommentId = (commentId) => {
  const { error } = schemas.commentId.validate({ commentId });
  return !error;
};