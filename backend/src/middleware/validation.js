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
  signup: Joi.alternatives().try(
    // New shape: either email OR (isd_code + phone_number)
    Joi.object({
      email: Joi.string().email(),
      isd_code: Joi.string().pattern(/^\+[0-9]{1,4}$/),
      phone_number: Joi.string().pattern(/^[0-9]{7,15}$/),
      username: Joi.string().alphanum().min(3).max(50).required(),
      password: Joi.string().min(6).max(128).required(),
      termsAccepted: Joi.boolean().valid(true).required(),
    }).xor('email', 'phone_number').with('phone_number', 'isd_code'),
    // Legacy shape: emailOrPhone
    Joi.object({
      emailOrPhone: Joi.alternatives().try(
        Joi.string().email(),
        Joi.string().pattern(/^[+]?[- ().0-9]{5,}$/)
      ).required(),
      username: Joi.string().alphanum().min(3).max(50).required(),
      password: Joi.string().min(6).max(128).required(),
      termsAccepted: Joi.boolean().valid(true).required(),
    })
  ),

  login: Joi.object({
    // Accept a generic identifier that can be email, username, or phone
    identifier: Joi.string().min(1).required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  // Phone-based: request a PIN to be sent to user's registered phone via emailOrPhone or phone
  forgotPasswordPhone: Joi.object({
    phone: Joi.string().pattern(/^[+]?[- ().0-9]{5,}$/).required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().min(10).max(255).required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  // Phone-based: verify PIN and set password
  resetPasswordWithPin: Joi.object({
    phone: Joi.string().pattern(/^[+]?[- ().0-9]{5,}$/).required(),
    pin: Joi.string().min(4).max(12).required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  // Profile updates (single-field endpoints)
  updateUsername: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
  }),
  updateEmail: Joi.object({
    email: Joi.string().email().required(),
  }),
  updatePhone: Joi.object({
    phone: Joi.string().pattern(/^[+]?[- ().0-9]{0,32}$/).allow(null, '').optional(),
  }),
  updatePassword: Joi.object({
    password: Joi.string().min(6).max(128).required(),
  }),

  // Unified endpoint allowing exactly one of the fields
  updateProfileOneOf: Joi.object({
    username: Joi.string().alphanum().min(3).max(50),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[+]?[- ().0-9]{0,32}$/).allow(null, ''),
    password: Joi.string().min(6).max(128),
  }).xor('username', 'email', 'phone', 'password'),
};

// Comic validation schemas
export const comicSchemas = {
  create: Joi.object({
    file_id: Joi.string().min(3).required(),
    title: Joi.string().min(1).max(255).required(),
    series_id: Joi.string().guid({ version: 'uuidv4' }).required(),
    upload_agreement: Joi.boolean().valid(true).required(),

    // Optional metadata
    subtitle: Joi.string().max(255).optional(),
    genres: Joi.array().items(Joi.string().max(50)).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    description: Joi.string().max(5000).optional(),
  thumbnail_url: Joi.string().uri().max(1000).optional(),
  // When multipart, field exists as a file (handled by multer) and not part of body
  thumbnailUpload: Joi.any().optional(),
    age_restricted: Joi.boolean().optional(),
    public: Joi.boolean().optional(),
    price: Joi.number().min(0).precision(2).optional(),
    offer_on_price: Joi.boolean().optional(),
    contributors: Joi.alternatives().try(
      Joi.array().items(
        Joi.object({
          role: Joi.string().max(100).required(),
          names: Joi.array().items(Joi.string().max(255)).min(1).required(),
        })
      ),
      // When multipart, client may send JSON string
      Joi.string().custom((v, helpers) => {
        try { const arr = JSON.parse(v); if (!Array.isArray(arr)) throw new Error(''); return arr }
        catch { return helpers.error('any.invalid') }
      })
    ).optional(),
    page_order: Joi.alternatives().try(
      Joi.array().items(Joi.string().max(500)),
      Joi.array().items(Joi.string().max(500)).single(),
      Joi.string().custom((v, helpers) => {
        try { const arr = JSON.parse(v); if (!Array.isArray(arr)) throw new Error(''); return arr }
        catch { return helpers.error('any.invalid') }
      })
    ).optional(),

    // Optional file meta (needed for single-file create to satisfy model)
    file_name: Joi.string().max(255).optional(),
    file_size: Joi.number().integer().min(1).optional(),
    file_type: Joi.string().max(100).optional(),
    s3_url: Joi.string().uri().max(1000).optional(),
  }),
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
    subtitle: Joi.string().max(255).optional(),
    description: Joi.string().max(5000).optional(),
    genres: Joi.array().items(Joi.string().max(50)).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
  thumbnail_url: Joi.string().uri().max(1000).optional(),
  // thumbnailUpload is a file (multer); allow its presence
  thumbnailUpload: Joi.any().optional(),
    age_restricted: Joi.boolean().optional(),
    public: Joi.boolean().optional(),
    price: Joi.number().min(0).precision(2).optional(),
    offer_on_price: Joi.boolean().optional(),
    contributors: Joi.array().items(
      Joi.object({
        role: Joi.string().max(100).required(),
        names: Joi.array().items(Joi.string().max(255)).min(1).required(),
      })
    ).optional(),
    page_order: Joi.array().items(Joi.string().max(500)).optional(),
    status: Joi.string().valid('draft', 'published').optional(),
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

// Series validation schemas
export const seriesSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(2000).optional(),
    genre: Joi.string().max(100).optional(),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string().max(50)).max(20),
      Joi.string().custom((v, helpers) => {
        try { const arr = JSON.parse(v); if (!Array.isArray(arr)) throw new Error(''); return arr }
        catch { return helpers.error('any.invalid') }
      })
    ).optional(),
    ageRating: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17').optional(),
    language: Joi.string().max(10).default('en').optional(),
    status: Joi.string().valid('ongoing', 'completed', 'hiatus', 'cancelled').default('ongoing').optional(),
    isPublic: Joi.boolean().default(true).optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    genre: Joi.string().max(100).optional(),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string().max(50)).max(20),
      Joi.string().custom((v, helpers) => {
        try { const arr = JSON.parse(v); if (!Array.isArray(arr)) throw new Error(''); return arr }
        catch { return helpers.error('any.invalid') }
      })
    ).optional(),
    ageRating: Joi.string().valid('G', 'PG', 'PG-13', 'R', 'NC-17').optional(),
    language: Joi.string().max(10).optional(),
    status: Joi.string().valid('ongoing', 'completed', 'hiatus', 'cancelled').optional(),
    isPublic: Joi.boolean().optional(),
  }),
};

// Creator Profile validation schemas
export const creatorProfileSchemas = {
  createOrUpdate: Joi.object({
    displayName: Joi.string().max(255).optional(),
    bio: Joi.string().max(2000).optional(),
    socialLinks: Joi.object().pattern(
      Joi.string().valid('twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'discord'),
      Joi.string().uri().max(500)
    ).optional(),
    websiteUrl: Joi.string().uri().max(500).optional(),
    customColorTheme: Joi.object({
      primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
    watermarkEnabled: Joi.boolean().optional(),
    allowComments: Joi.boolean().optional(),
    moderateComments: Joi.boolean().optional(),
    emailNotifications: Joi.boolean().optional(),
    publicStats: Joi.boolean().optional(),
    acceptDonations: Joi.boolean().optional(),
    subscriptionTiers: Joi.array().items(
      Joi.object({
        name: Joi.string().max(100).required(),
        description: Joi.string().max(500).optional(),
        price: Joi.number().min(0).required(),
        currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
        benefits: Joi.array().items(Joi.string().max(200)).optional(),
      })
    ).optional(),
  }),
};

// Validation helper functions
export const validateSeriesData = (data) => seriesSchemas.create.validate(data);
export const validateSeriesUpdate = (data) => seriesSchemas.update.validate(data);
export const validateCreatorProfileData = (data) => creatorProfileSchemas.createOrUpdate.validate(data);