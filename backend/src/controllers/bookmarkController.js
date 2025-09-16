import { Bookmark, Comic, Series } from '../models/index.js';

export class BookmarkController {
  /**
   * Get all bookmarks for the authenticated user
   */
  static async getBookmarks(req, res) {
    try {
      const userId = req.user.id;
      const { type, page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { userId };

      if (type) {
        whereClause.type = type;
      }

      const bookmarks = await Bookmark.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: req.user.constructor,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
      });

      // Enrich bookmarks with item details
      const enrichedBookmarks = await Promise.all(
        bookmarks.rows.map(async (bookmark) => {
          let itemDetails = null;

          try {
            if (bookmark.type === 'comic') {
              itemDetails = await Comic.findByPk(bookmark.itemId, {
                attributes: ['id', 'title', 'author', 'thumbnailS3Url', 'description'],
              });
            } else if (bookmark.type === 'series') {
              itemDetails = await Series.findByPk(bookmark.itemId, {
                attributes: ['id', 'title', 'description', 'coverImageUrl'],
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch details for ${bookmark.type} ${bookmark.itemId}:`, error.message);
          }

          return {
            ...bookmark.toJSON(),
            itemDetails,
          };
        })
      );

      const totalPages = Math.ceil(bookmarks.count / limit);

      res.json({
        success: true,
        data: {
          bookmarks: enrichedBookmarks,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: bookmarks.count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get bookmarks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookmarks',
      });
    }
  }

  /**
   * Add a new bookmark
   */
  static async addBookmark(req, res) {
    try {
      const userId = req.user.id;
      const { itemId, type = 'comic', metadata = {} } = req.body;

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required',
        });
      }

      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findOne({
        where: {
          userId,
          itemId,
          type,
        },
      });

      if (existingBookmark) {
        return res.status(409).json({
          success: false,
          message: 'Bookmark already exists',
          data: { bookmark: existingBookmark },
        });
      }

      // Verify the item exists
      let itemExists = false;
      if (type === 'comic') {
        const comic = await Comic.findByPk(itemId);
        itemExists = !!comic;
      } else if (type === 'series') {
        const series = await Series.findByPk(itemId);
        itemExists = !!series;
      } else {
        // For pages, we just trust the itemId for now
        itemExists = true;
      }

      if (!itemExists) {
        return res.status(404).json({
          success: false,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
        });
      }

      const bookmark = await Bookmark.create({
        userId,
        itemId,
        type,
        metadata,
      });

      res.status(201).json({
        success: true,
        message: 'Bookmark added successfully',
        data: { bookmark },
      });
    } catch (error) {
      console.error('Add bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bookmark',
      });
    }
  }

  /**
   * Remove a bookmark
   */
  static async removeBookmark(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const bookmark = await Bookmark.findOne({
        where: {
          id,
          userId, // Ensure user can only delete their own bookmarks
        },
      });

      if (!bookmark) {
        return res.status(404).json({
          success: false,
          message: 'Bookmark not found',
        });
      }

      await bookmark.destroy();

      res.json({
        success: true,
        message: 'Bookmark removed successfully',
      });
    } catch (error) {
      console.error('Remove bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove bookmark',
      });
    }
  }

  /**
   * Toggle bookmark (add if doesn't exist, remove if exists)
   */
  static async toggleBookmark(req, res) {
    try {
      const userId = req.user.id;
      const { itemId, type = 'comic', metadata = {} } = req.body;

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required',
        });
      }

      const existingBookmark = await Bookmark.findOne({
        where: {
          userId,
          itemId,
          type,
        },
      });

      if (existingBookmark) {
        // Remove existing bookmark
        await existingBookmark.destroy();
        return res.json({
          success: true,
          message: 'Bookmark removed',
          data: { action: 'removed', bookmarked: false },
        });
      } else {
        // Add new bookmark
        // Verify the item exists
        let itemExists = false;
        if (type === 'comic') {
          const comic = await Comic.findByPk(itemId);
          itemExists = !!comic;
        } else if (type === 'series') {
          const series = await Series.findByPk(itemId);
          itemExists = !!series;
        } else {
          itemExists = true;
        }

        if (!itemExists) {
          return res.status(404).json({
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
          });
        }

        const bookmark = await Bookmark.create({
          userId,
          itemId,
          type,
          metadata,
        });

        return res.status(201).json({
          success: true,
          message: 'Bookmark added',
          data: { action: 'added', bookmarked: true, bookmark },
        });
      }
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle bookmark',
      });
    }
  }

  /**
   * Check if an item is bookmarked
   */
  static async checkBookmark(req, res) {
    try {
      const userId = req.user.id;
      const { itemId, type = 'comic' } = req.query;

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required',
        });
      }

      const bookmark = await Bookmark.findOne({
        where: {
          userId,
          itemId,
          type,
        },
      });

      res.json({
        success: true,
        data: {
          bookmarked: !!bookmark,
          bookmark: bookmark || null,
        },
      });
    } catch (error) {
      console.error('Check bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check bookmark status',
      });
    }
  }
}