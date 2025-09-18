import { Comic, User, ComicContributor } from '../models/index.js';
import { s3Service } from './s3Service.js';
import { Op } from 'sequelize';

/**
 * Comic service for managing comic operations
 */
export class ComicService {
  /**
   * Upload a new comic
   */
  static async uploadComic(file, metadata, uploaderId) {
    try {
      // Upload file to S3
      const s3Result = await s3Service.uploadFile(file, 'comics');

      // Create comic record in database
      const comic = await Comic.create({
        ...metadata,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        s3Key: s3Result.key,
        s3Url: s3Result.url,
        uploaderId,
      });

      // Include uploader information
      const comicWithUploader = await Comic.findByPk(comic.id, {
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'username'],
        }],
      });

      return comicWithUploader;
    } catch (error) {
      console.error('Error uploading comic:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images and return a temporary uploadId with pageOrder
   */
  static async uploadImages(files, uploaderId) {
    if (!Array.isArray(files) || files.length === 0) {
      const err = new Error('No files provided');
      err.statusCode = 400;
      throw err;
    }

    // Sort files by original name to infer order (page-001.jpg, etc.)
    const sorted = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true, sensitivity: 'base' }));

    const uploads = [];
    for (const file of sorted) {
      const s3Result = await s3Service.uploadFile(file, 'comics/pages');
      uploads.push({
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        s3Key: s3Result.key,
        url: s3Result.url,
      });
    }

    const pageOrder = uploads.map(u => u.s3Key);
    // Temporary upload ID (does not persist pages yet). For now we can reuse first key suffix.
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return { uploadId, pageOrder, uploads, count: uploads.length, uploaderId };
  }

  /**
   * Get comics with pagination and filtering
   */
  static async getComics(query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'DESC',
      search,
      genre,
      author,
      tags,
    } = query;

    // Build where clause
    const where = {
      isActive: true,
      isPublic: true,
      publishStatus: 'published', // Only show published comics to public
    };

    // Add search conditions
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (genre) {
      where.genre = { [Op.iLike]: `%${genre}%` };
    }

    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        [Op.overlap]: tagArray,
      };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch comics
    const { count, rows } = await Comic.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'uploader',
  attributes: ['id', 'username'],
      }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      comics: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Get a specific comic by ID
   */
  static async getComicById(id, userId = null) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
      },
      include: [{
        model: User,
        as: 'uploader',
  attributes: ['id', 'username'],
      }],
    });

    if (!comic) {
      throw new Error('Comic not found');
    }

    // Check if comic is public or user is the owner
    if (!comic.isPublic && (!userId || comic.uploaderId !== userId)) {
      throw new Error('Access denied');
    }

    // Increment view count
    await comic.increment('viewCount');

    // Generate presigned URL for file access
    const fileUrl = await s3Service.getPresignedUrl(comic.s3Key);

    return {
      ...comic.toJSON(),
      fileUrl,
    };
  }

  /**
   * Update comic metadata
   */
  static async updateComic(id, updates, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    await comic.update(updates);

    return comic;
  }

  /**
   * Delete comic
   */
  static async deleteComic(id, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    // Delete file from S3
    await s3Service.deleteFile(comic.s3Key);

    // Delete thumbnail if exists
    if (comic.thumbnailS3Key) {
      await s3Service.deleteFile(comic.thumbnailS3Key);
    }

    // Soft delete from database
    await comic.update({ isActive: false });

    return { message: 'Comic deleted successfully' };
  }

  /**
   * Get user's comics
   */
  static async getUserComics(userId, query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'DESC',
    } = query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Comic.findAndCountAll({
      where: {
        uploaderId: userId,
        isActive: true,
      },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      comics: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Create a Comic record from a prior upload.
   * Supports either a single-file upload (file_id maps to s3Key), or multi-image upload using page_order array.
   */
  static async createComic(payload, userId, thumbnailFile) {
    // Normalize potential multipart stringified arrays
    const coerceArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
    const parseMaybeJson = (v) => {
      if (Array.isArray(v)) return v
      if (typeof v === 'string') {
        try { const parsed = JSON.parse(v); return parsed }
        catch { return v }
      }
      return v
    }

    const {
      file_id,
      title,
      series_id,
      upload_agreement,
      subtitle,
      genres: genresRaw,
      tags: tagsRaw,
      description,
      thumbnail_url,
  // thumbnailUpload reserved for future; ignore for now
      age_restricted,
      public: isPublic,
      price,
      offer_on_price,
      contributors: contributorsRaw,
      page_order: page_orderRaw,
      file_name,
      file_size,
      file_type,
      s3_url,
  } = payload;

    const genres = parseMaybeJson(genresRaw)
    const tags = parseMaybeJson(tagsRaw)
    let contributors = parseMaybeJson(contributorsRaw)
    let page_order = parseMaybeJson(page_orderRaw)
    if (typeof page_order === 'string') page_order = coerceArray(page_order)

    if (!upload_agreement) {
      const err = new Error('Upload agreement must be accepted');
      err.statusCode = 400;
      throw err;
    }

    // At least file_id (for single file) or page_order (for images) must be provided
    if (!file_id && (!Array.isArray(page_order) || page_order.length === 0)) {
      const err = new Error('Missing file reference: provide file_id or page_order');
      err.statusCode = 400;
      throw err;
    }

    // Build create payload
    const createData = {
      title,
      subtitle,
      description,
      genres,
      tags,
      isPublic: typeof isPublic === 'boolean' ? isPublic : true,
      public: isPublic,
      ageRestricted: !!age_restricted,
      price,
      offerOnPrice: !!offer_on_price,
      status: 'draft',
      publishStatus: 'draft',
      uploaderId: userId,
      seriesId: series_id,
    };

    if (file_id) {
      // For now, treat file_id as an S3 key. URL can be derived or provided.
      createData.s3Key = file_id;
      createData.s3Url = s3_url || `https://example.com/${file_id}`;
      createData.fileName = file_name || 'upload';
      createData.fileSize = file_size || 1;
      createData.fileType = file_type || 'application/octet-stream';
    }

    if (thumbnail_url) {
      createData.thumbnailUrl = thumbnail_url;
    }

    // If a thumbnail file is uploaded, store it and persist S3 key/url
    if (thumbnailFile) {
      const s3thumb = await s3Service.uploadFile(thumbnailFile, 'comics/thumbnails');
      createData.thumbnailS3Key = s3thumb.key;
      createData.thumbnailS3Url = s3thumb.url;
      // If both url and file are provided, prefer explicit URL for display, but keep S3 for backup
    }

    if (Array.isArray(page_order) && page_order.length) {
      createData.pageOrder = page_order;
      // For a multi-image comic, we still need s3Key/s3Url to satisfy model requirements; synthesize a virtual archive key
      if (!file_id) {
        const virtualKey = `comics/virtual/${Date.now()}-${Math.random().toString(36).slice(2,8)}.zip`;
        createData.s3Key = virtualKey;
        createData.s3Url = `https://example.com/${virtualKey}`;
        createData.fileName = 'images.zip';
        createData.fileSize = 1;
        createData.fileType = 'application/zip';
      }
    }

    const comic = await Comic.create(createData);

    // Save contributors if provided
    if (Array.isArray(contributors) && contributors.length) {
      for (const c of contributors) {
        await ComicContributor.create({
          comicId: comic.id,
          role: c.role,
          contributors: c.names,
        });
      }
    }

    return comic;
  }

  /**
   * Patch metadata and optionally publish
   */
  static async patchComic(id, updates, userId, thumbnailFile) {
    const comic = await Comic.findOne({ where: { id, uploaderId: userId, isActive: true } });
    if (!comic) {
      const err = new Error('Comic not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    // Handle contributors update
  const { contributors, status, ...rest } = updates;

    // Map snake_case to model fields
    const mapped = {
      ...rest,
      public: rest.public,
      ageRestricted: typeof rest.age_restricted === 'boolean' ? rest.age_restricted : undefined,
      offerOnPrice: typeof rest.offer_on_price === 'boolean' ? rest.offer_on_price : undefined,
      thumbnailUrl: rest.thumbnail_url,
    };
    // Clean undefined
    Object.keys(mapped).forEach(k => mapped[k] === undefined && delete mapped[k]);

    if (Object.keys(mapped).length) {
      await comic.update(mapped);
    }

    // Handle thumbnail file replacement if provided
    if (thumbnailFile) {
      // Upload new thumbnail
      const s3thumb = await s3Service.uploadFile(thumbnailFile, 'comics/thumbnails');
      // Delete previous thumbnail if exists
      if (comic.thumbnailS3Key) {
        try { await s3Service.deleteFile(comic.thumbnailS3Key); } catch {}
      }
      await comic.update({ thumbnailS3Key: s3thumb.key, thumbnailS3Url: s3thumb.url });
    }

    if (Array.isArray(contributors)) {
      // Replace contributors set
      await ComicContributor.destroy({ where: { comicId: comic.id } });
      for (const c of contributors) {
        await ComicContributor.create({ comicId: comic.id, role: c.role, contributors: c.names });
      }
    }

    if (status === 'published') {
      await comic.update({ status: 'published', publishStatus: 'published', publishedAt: new Date() });
    }

    return comic;
  }

  /**
   * Get draft preview: owner-only and only for drafts
   */
  static async getDraftPreview(id, userId) {
    const comic = await Comic.findOne({ where: { id, uploaderId: userId, isActive: true } });
    if (!comic) {
      const err = new Error('Comic not found or access denied');
      err.statusCode = 404;
      throw err;
    }
    if (comic.status !== 'draft') {
      const err = new Error('Preview available only for drafts');
      err.statusCode = 400;
      throw err;
    }

    return {
      id: comic.id,
      title: comic.title,
      subtitle: comic.subtitle,
      description: comic.description,
      pageOrder: comic.pageOrder || [],
      thumbnailUrl: comic.thumbnailUrl || comic.thumbnailS3Url,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
    };
  }

  /**
   * Publish a comic
   */
  static async publishComic(id, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    await comic.update({
      publishStatus: 'published',
      publishedAt: new Date(),
    });

    return comic;
  }

  /**
   * Schedule a comic for publishing
   */
  static async scheduleComic(id, scheduledAt, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    await comic.update({
      publishStatus: 'scheduled',
      scheduledAt: new Date(scheduledAt),
    });

    return comic;
  }

  /**
   * Draft a comic (unpublish)
   */
  static async draftComic(id, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    await comic.update({
      publishStatus: 'draft',
      publishedAt: null,
      scheduledAt: null,
    });

    return comic;
  }

  /**
   * Archive a comic
   */
  static async archiveComic(id, userId) {
    const comic = await Comic.findOne({
      where: {
        id,
        isActive: true,
        uploaderId: userId,
      },
    });

    if (!comic) {
      throw new Error('Comic not found or access denied');
    }

    await comic.update({
      publishStatus: 'archived',
    });

    return comic;
  }

  /**
   * Get comics by publish status for creator
   */
  static async getComicsByStatus(userId, status, query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'DESC',
    } = query;

    const where = {
      uploaderId: userId,
      isActive: true,
      publishStatus: status,
    };

    const offset = (page - 1) * limit;

    const { count, rows: comics } = await Comic.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username'],
        },
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      comics,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }
}