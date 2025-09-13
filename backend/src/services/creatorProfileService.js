import { CreatorProfile, User } from '../models/index.js';
import { s3Service } from './s3Service.js';

/**
 * Creator Profile service for managing creator profile operations
 */
export class CreatorProfileService {
  /**
   * Create or update creator profile
   */
  static async createOrUpdateProfile(userId, profileData, files = {}) {
    try {
      let updateData = { ...profileData };

      // Handle file uploads
      if (files.profilePicture) {
        const s3Result = await s3Service.uploadFile(files.profilePicture, 'profile-pictures');
        updateData.profilePictureS3Key = s3Result.key;
        updateData.profilePictureS3Url = s3Result.url;
      }

      if (files.bannerImage) {
        const s3Result = await s3Service.uploadFile(files.bannerImage, 'banner-images');
        updateData.bannerImageS3Key = s3Result.key;
        updateData.bannerImageS3Url = s3Result.url;
      }

      if (files.logo) {
        const s3Result = await s3Service.uploadFile(files.logo, 'creator-logos');
        updateData.logoS3Key = s3Result.key;
        updateData.logoS3Url = s3Result.url;
      }

      if (files.watermark) {
        const s3Result = await s3Service.uploadFile(files.watermark, 'watermarks');
        updateData.watermarkS3Key = s3Result.key;
        updateData.watermarkS3Url = s3Result.url;
      }

      // Find existing profile or create new one
      let profile = await CreatorProfile.findOne({ where: { userId } });

      if (profile) {
        // Delete old files if new ones are uploaded
        if (files.profilePicture && profile.profilePictureS3Key) {
          try {
            await s3Service.deleteFile(profile.profilePictureS3Key);
          } catch (error) {
            console.warn('Failed to delete old profile picture:', error);
          }
        }

        if (files.bannerImage && profile.bannerImageS3Key) {
          try {
            await s3Service.deleteFile(profile.bannerImageS3Key);
          } catch (error) {
            console.warn('Failed to delete old banner image:', error);
          }
        }

        if (files.logo && profile.logoS3Key) {
          try {
            await s3Service.deleteFile(profile.logoS3Key);
          } catch (error) {
            console.warn('Failed to delete old logo:', error);
          }
        }

        if (files.watermark && profile.watermarkS3Key) {
          try {
            await s3Service.deleteFile(profile.watermarkS3Key);
          } catch (error) {
            console.warn('Failed to delete old watermark:', error);
          }
        }

        await profile.update(updateData);
      } else {
        profile = await CreatorProfile.create({
          ...updateData,
          userId,
        });
      }

      // Include user information
      const profileWithUser = await CreatorProfile.findByPk(profile.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
        }],
      });

      return profileWithUser;
    } catch (error) {
      console.error('Error creating/updating creator profile:', error);
      throw error;
    }
  }

  /**
   * Get creator profile by user ID
   */
  static async getProfileByUserId(userId) {
    const profile = await CreatorProfile.findOne({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
      }],
    });

    return profile;
  }

  /**
   * Get public creator profile for display
   */
  static async getPublicProfile(userId) {
    const profile = await CreatorProfile.findOne({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName'],
      }],
    });

    if (!profile) {
      return null;
    }

    // Return only public information
    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      profilePictureS3Url: profile.profilePictureS3Url,
      bannerImageS3Url: profile.bannerImageS3Url,
      socialLinks: profile.socialLinks,
      websiteUrl: profile.websiteUrl,
      logoS3Url: profile.logoS3Url,
      customColorTheme: profile.customColorTheme,
      publicStats: profile.publicStats,
      acceptDonations: profile.acceptDonations,
      subscriptionTiers: profile.subscriptionTiers,
      user: profile.user,
      createdAt: profile.createdAt,
    };
  }

  /**
   * Update creator settings
   */
  static async updateSettings(userId, settings) {
    const profile = await CreatorProfile.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Creator profile not found');
    }

    const allowedSettings = [
      'allowComments',
      'moderateComments',
      'emailNotifications',
      'publicStats',
      'acceptDonations',
      'watermarkEnabled',
    ];

    const updateData = {};
    allowedSettings.forEach(setting => {
      if (settings.hasOwnProperty(setting)) {
        updateData[setting] = settings[setting];
      }
    });

    await profile.update(updateData);

    return profile;
  }

  /**
   * Update subscription tiers
   */
  static async updateSubscriptionTiers(userId, tiers) {
    const profile = await CreatorProfile.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Creator profile not found');
    }

    await profile.update({ subscriptionTiers: tiers });

    return profile;
  }

  /**
   * Delete creator profile
   */
  static async deleteProfile(userId) {
    const profile = await CreatorProfile.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Creator profile not found');
    }

    // Delete associated files
    const filesToDelete = [
      profile.profilePictureS3Key,
      profile.bannerImageS3Key,
      profile.logoS3Key,
      profile.watermarkS3Key,
    ].filter(Boolean);

    const deletePromises = filesToDelete.map(key => 
      s3Service.deleteFile(key).catch(error => 
        console.warn(`Failed to delete file ${key}:`, error)
      )
    );

    await Promise.all(deletePromises);

    // Delete profile record
    await profile.destroy();

    return { message: 'Creator profile deleted successfully' };
  }

  /**
   * Search creator profiles
   */
  static async searchProfiles(query = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      sort = 'createdAt',
      order = 'DESC',
    } = query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { displayName: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: profiles } = await CreatorProfile.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName'],
      }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Return only public information
    const publicProfiles = profiles.map(profile => ({
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      profilePictureS3Url: profile.profilePictureS3Url,
      bannerImageS3Url: profile.bannerImageS3Url,
      socialLinks: profile.socialLinks,
      websiteUrl: profile.websiteUrl,
      logoS3Url: profile.logoS3Url,
      customColorTheme: profile.customColorTheme,
      user: profile.user,
      createdAt: profile.createdAt,
    }));

    return {
      profiles: publicProfiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }
}

export const creatorProfileService = new CreatorProfileService();