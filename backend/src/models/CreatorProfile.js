import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Creator Profile model for additional creator information
 */
export const CreatorProfile = sequelize.define('CreatorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Profile information
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profilePictureS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  profilePictureS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  bannerImageS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  bannerImageS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  // Social media links
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  websiteUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  // Branding options
  logoS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  logoS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  customColorTheme: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  watermarkEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  watermarkS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  watermarkS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  // Settings
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  moderateComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Analytics preferences
  publicStats: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Monetization settings
  acceptDonations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  subscriptionTiers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Foreign key to User
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'creator_profiles',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['displayName'],
    },
  ],
});