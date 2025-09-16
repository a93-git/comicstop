import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Page model for storing individual comic page information
 */
export const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pageNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  imagePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Local file path to the page image',
  },
  imageS3Key: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'S3 key for uploaded page image',
  },
  imageS3Url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'S3 URL for uploaded page image',
  },
  // Foreign key
  comicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'comics',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'pages',
  timestamps: true,
  indexes: [
    {
      fields: ['comicId'],
    },
    {
      fields: ['comicId', 'pageNumber'],
      unique: true,
    },
  ],
});

/**
 * Define associations
 */
export const definePageAssociations = (Comic) => {
  Page.belongsTo(Comic, {
    foreignKey: 'comicId',
    as: 'comic',
  });
  
  Comic.hasMany(Page, {
    foreignKey: 'comicId',
    as: 'pages',
  });
};