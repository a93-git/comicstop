import { CreatorProfileService } from '../services/creatorProfileService.js';
import { validateCreatorProfileData } from '../middleware/validation.js';

/**
 * Creator Profile controller for handling creator profile requests
 */
export class CreatorProfileController {
  /**
   * Create or update creator profile
   */
  static async createOrUpdateProfile(req, res) {
    try {
      const { error } = validateCreatorProfileData(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
        });
      }

      const userId = req.user.id;
      const files = {
        profilePicture: req.files?.profilePicture?.[0],
        bannerImage: req.files?.bannerImage?.[0],
        logo: req.files?.logo?.[0],
        watermark: req.files?.watermark?.[0],
      };

      const profile = await CreatorProfileService.createOrUpdateProfile(userId, req.body, files);

      res.json({
        success: true,
        message: 'Creator profile updated successfully',
        data: {
          profile,
        },
      });
    } catch (error) {
      console.error('Create/update creator profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update creator profile',
        error: error.message,
      });
    }
  }

  /**
   * Get current user's creator profile
   */
  static async getMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await CreatorProfileService.getProfileByUserId(userId);

      res.json({
        success: true,
        data: {
          profile,
        },
      });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch creator profile',
        error: error.message,
      });
    }
  }

  /**
   * Get public creator profile
   */
  static async getPublicProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await CreatorProfileService.getPublicProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Creator profile not found',
        });
      }

      res.json({
        success: true,
        data: {
          profile,
        },
      });
    } catch (error) {
      console.error('Get public profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch creator profile',
        error: error.message,
      });
    }
  }

  /**
   * Update creator settings
   */
  static async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const profile = await CreatorProfileService.updateSettings(userId, req.body);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: {
          profile,
        },
      });
    } catch (error) {
      console.error('Update settings error:', error);
      const statusCode = error.message === 'Creator profile not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update subscription tiers
   */
  static async updateSubscriptionTiers(req, res) {
    try {
      const userId = req.user.id;
      const { tiers } = req.body;

      if (!Array.isArray(tiers)) {
        return res.status(400).json({
          success: false,
          message: 'Tiers must be an array',
        });
      }

      const profile = await CreatorProfileService.updateSubscriptionTiers(userId, tiers);

      res.json({
        success: true,
        message: 'Subscription tiers updated successfully',
        data: {
          profile,
        },
      });
    } catch (error) {
      console.error('Update subscription tiers error:', error);
      const statusCode = error.message === 'Creator profile not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete creator profile
   */
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await CreatorProfileService.deleteProfile(userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete profile error:', error);
      const statusCode = error.message === 'Creator profile not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Search creator profiles
   */
  static async searchProfiles(req, res) {
    try {
      const result = await CreatorProfileService.searchProfiles(req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Search profiles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search creator profiles',
        error: error.message,
      });
    }
  }
}