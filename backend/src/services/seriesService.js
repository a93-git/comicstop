import { Series, Comic, User } from '../models/index.js';
import { s3Service } from './s3Service.js';
import { Op } from 'sequelize';

/**
 * Series service for managing series operations
 */
export class SeriesService {
  /**
   * Create a new series
   */
  static async createSeries(seriesData, creatorId, coverArtFile = null) {
    try {
      let coverArtInfo = {};
      
      // Upload cover art if provided
      if (coverArtFile) {
        const s3Result = await s3Service.uploadFile(coverArtFile, 'series-covers');
        coverArtInfo = {
          coverArtS3Key: s3Result.key,
          coverArtS3Url: s3Result.url,
        };
      }

      // Create series record
      const series = await Series.create({
        ...seriesData,
        ...coverArtInfo,
        creatorId,
      });

      // Include creator information
      const seriesWithCreator = await Series.findByPk(series.id, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        }],
      });

      return seriesWithCreator;
    } catch (error) {
      console.error('Error creating series:', error);
      throw error;
    }
  }

  /**
   * Get series with pagination and filtering
   */
  static async getSeries(query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'DESC',
      search,
      genre,
      status,
      creatorId,
    } = query;

    // Build where clause
    const where = {
      isActive: true,
      isPublic: true,
    };

    // Add search conditions
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (genre) {
      where.genre = { [Op.iLike]: `%${genre}%` };
    }

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch series with pagination
    const { count, rows: series } = await Series.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
        {
          model: Comic,
          as: 'comics',
          attributes: ['id', 'title', 'chapterNumber', 'publishStatus'],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      series,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Get a specific series by ID
   */
  static async getSeriesById(id, userId = null) {
    const where = {
      id,
      isActive: true,
    };

    // If no userId provided, only show public series
    if (!userId) {
      where.isPublic = true;
    }

    const series = await Series.findOne({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
        {
          model: Comic,
          as: 'comics',
          attributes: ['id', 'title', 'chapterNumber', 'publishStatus', 'publishedAt', 'viewCount'],
          where: { isActive: true },
          required: false,
          order: [['chapterNumber', 'ASC']],
        },
      ],
    });

    if (!series) {
      throw new Error('Series not found');
    }

    return series;
  }

  /**
   * Update series
   */
  static async updateSeries(id, updates, userId, coverArtFile = null) {
    const series = await Series.findOne({
      where: {
        id,
        isActive: true,
        creatorId: userId,
      },
    });

    if (!series) {
      throw new Error('Series not found or access denied');
    }

    let updateData = { ...updates };

    // Upload new cover art if provided
    if (coverArtFile) {
      // Delete old cover art if exists
      if (series.coverArtS3Key) {
        try {
          await s3Service.deleteFile(series.coverArtS3Key);
        } catch (error) {
          console.warn('Failed to delete old cover art:', error);
        }
      }

      // Upload new cover art
      const s3Result = await s3Service.uploadFile(coverArtFile, 'series-covers');
      updateData.coverArtS3Key = s3Result.key;
      updateData.coverArtS3Url = s3Result.url;
    }

    await series.update(updateData);

    return series;
  }

  /**
   * Delete series
   */
  static async deleteSeries(id, userId) {
    const series = await Series.findOne({
      where: {
        id,
        isActive: true,
        creatorId: userId,
      },
    });

    if (!series) {
      throw new Error('Series not found or access denied');
    }

    // Soft delete - set isActive to false
    await series.update({ isActive: false });

    // Also soft delete all comics in the series
    await Comic.update(
      { isActive: false },
      {
        where: {
          seriesId: id,
          isActive: true,
        },
      }
    );

    return { message: 'Series deleted successfully' };
  }

  /**
   * Get creator's series
   */
  static async getCreatorSeries(creatorId, query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'DESC',
      status,
    } = query;

    const where = {
      creatorId,
      isActive: true,
    };

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: series } = await Series.findAndCountAll({
      where,
      include: [
        {
          model: Comic,
          as: 'comics',
          attributes: ['id', 'title', 'chapterNumber', 'publishStatus'],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      series,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Reorder comics in a series
   */
  static async reorderComics(seriesId, comicOrderData, userId) {
    const series = await Series.findOne({
      where: {
        id: seriesId,
        isActive: true,
        creatorId: userId,
      },
    });

    if (!series) {
      throw new Error('Series not found or access denied');
    }

    // Update chapter numbers for each comic
    const updatePromises = comicOrderData.map(({ comicId, chapterNumber }) =>
      Comic.update(
        { chapterNumber },
        {
          where: {
            id: comicId,
            seriesId,
            uploaderId: userId,
            isActive: true,
          },
        }
      )
    );

    await Promise.all(updatePromises);

    return { message: 'Comics reordered successfully' };
  }
}

export const seriesService = new SeriesService();