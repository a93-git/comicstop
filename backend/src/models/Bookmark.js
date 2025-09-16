import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Bookmark model for user favorites
 */
export const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the bookmarked item (comic, series, etc.)',
  },
  type: {
    type: DataTypes.ENUM('comic', 'series', 'page'),
    allowNull: false,
    defaultValue: 'comic',
    comment: 'Type of item being bookmarked',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata like page number, title, etc.',
  },
  // Foreign key
  userId: {
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
  tableName: 'bookmarks',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['itemId', 'type'],
    },
    {
      fields: ['userId', 'itemId', 'type'],
      unique: true, // Prevent duplicate bookmarks
    },
  ],
});

/**
 * Define associations
 */
export const defineBookmarkAssociations = (User) => {
  Bookmark.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
  
  User.hasMany(Bookmark, {
    foreignKey: 'userId',
    as: 'bookmarks',
  });
};