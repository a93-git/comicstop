import { User } from './User.js';
import { Comic, defineComicAssociations } from './Comic.js';
import { Series } from './Series.js';
import { CreatorProfile } from './CreatorProfile.js';

// Define associations between models
defineComicAssociations(User);

// Series associations
Series.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
User.hasMany(Series, { foreignKey: 'creatorId', as: 'series' });

Series.hasMany(Comic, { foreignKey: 'seriesId', as: 'comics' });
Comic.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });

// Creator Profile associations
CreatorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(CreatorProfile, { foreignKey: 'userId', as: 'creatorProfile' });

export {
  User,
  Comic,
  Series,
  CreatorProfile,
};