import { Comic, User } from '../models/index.js';
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