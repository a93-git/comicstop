import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Comic model for storing comic metadata and file information
 */
export const Comic = sequelize.define('Comic', {
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
  subtitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { len: [0, 255] },
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  publicationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  genres: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of genres per spec',
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 5,
    },
  },
  pageCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
    },
  },
  // File information
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'Local or remote file path per spec',
  },
  s3Key: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
  },
  s3Url: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  // Thumbnail information
  thumbnailS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  thumbnailS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'Optional non-S3 thumbnail URL',
  },
  // Publishing and series information
  publishStatus: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published', 'archived'),
    defaultValue: 'draft',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Simplified status per spec (separate from publishStatus)',
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  chapterNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
    },
  },
  // Version control
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  // Status and visibility
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ageRestricted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  public: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'Visibility flag from spec; prefer isPublic in existing code',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  offerOnPrice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pageOrder: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Ordered list of page image identifiers',
  },
  // Foreign keys
  uploaderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  seriesId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'series',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'comics',
  timestamps: true,
  indexes: [
    {
      fields: ['uploaderId'],
    },
    {
      fields: ['title'],
    },
    {
      fields: ['author'],
    },
    {
      fields: ['genre'],
    },
    {
      fields: ['isPublic', 'isActive'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

/**
 * Define associations
 */
export const defineComicAssociations = (User) => {
  Comic.belongsTo(User, {
    foreignKey: 'uploaderId',
    as: 'uploader',
  });
  
  User.hasMany(Comic, {
    foreignKey: 'uploaderId',
    as: 'comics',
  });
};