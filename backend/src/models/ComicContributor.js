import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ComicContributor = sequelize.define('ComicContributor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  comicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'comics', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  contributors: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of contributor names',
  },
}, {
  tableName: 'comic_contributors',
  timestamps: true,
  indexes: [
    { fields: ['comicId'] },
    { fields: ['role'] },
  ],
});

export const defineComicContributorAssociations = (Comic) => {
  ComicContributor.belongsTo(Comic, { foreignKey: 'comicId', as: 'comic' })
  Comic.hasMany(ComicContributor, { foreignKey: 'comicId', as: 'contributors' })
}
