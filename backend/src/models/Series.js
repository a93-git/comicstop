import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Series model for grouping comics into series
 */
export const Series = sequelize.define('Series', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Cover art information
  coverArtS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  coverArtS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  // Series metadata
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  ageRating: {
    type: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17'),
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  // Status and visibility
  status: {
    type: DataTypes.ENUM('ongoing', 'completed', 'hiatus', 'cancelled'),
    defaultValue: 'ongoing',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Statistics
  totalChapters: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 5,
    },
  },
  // Foreign key to User (creator)
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'series',
  timestamps: true,
  indexes: [
    {
      fields: ['creatorId'],
    },
    {
      fields: ['isPublic', 'isActive'],
    },
    {
      fields: ['genre'],
    },
    {
      fields: ['status'],
    },
  ],
});