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
  // Status and visibility
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  // Foreign key to User
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