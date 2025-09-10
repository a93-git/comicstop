import Joi from 'joi';

/**
 * Validation middleware factory
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

// Authentication validation schemas
export const authSchemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).max(128).required(),
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Comic validation schemas
export const comicSchemas = {
  upload: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(2000).optional(),
    author: Joi.string().max(255).optional(),
    publisher: Joi.string().max(255).optional(),
    publicationDate: Joi.date().iso().optional(),
    genre: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    rating: Joi.number().min(0).max(5).precision(1).optional(),
    pageCount: Joi.number().integer().min(1).optional(),
    isPublic: Joi.boolean().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    author: Joi.string().max(255).optional(),
    publisher: Joi.string().max(255).optional(),
    publicationDate: Joi.date().iso().optional(),
    genre: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    rating: Joi.number().min(0).max(5).precision(1).optional(),
    pageCount: Joi.number().integer().min(1).optional(),
    isPublic: Joi.boolean().optional(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'title', 'author', 'rating', 'viewCount').default('createdAt'),
    order: Joi.string().valid('ASC', 'DESC').default('DESC'),
    search: Joi.string().max(255).optional(),
    genre: Joi.string().max(100).optional(),
    author: Joi.string().max(255).optional(),
    tags: Joi.string().optional(), // Comma-separated tags
  }),
};