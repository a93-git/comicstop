import { User } from './User.js';
import { Comic, defineComicAssociations } from './Comic.js';

// Define associations between models
defineComicAssociations(User);

export {
  User,
  Comic,
};