import express from 'express';
import { CreatorProfileController } from '../controllers/creatorProfileController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/search', CreatorProfileController.searchProfiles);
router.get('/:userId/public', CreatorProfileController.getPublicProfile);

// Protected routes (require authentication)
router.use(requireAuth);

// Creator profile management
const profileUpload = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'watermark', maxCount: 1 },
]);

router.get('/my', CreatorProfileController.getMyProfile);
router.post('/', profileUpload, CreatorProfileController.createOrUpdateProfile);
router.put('/', profileUpload, CreatorProfileController.createOrUpdateProfile);
router.delete('/', CreatorProfileController.deleteProfile);

// Settings management
router.put('/settings', CreatorProfileController.updateSettings);
router.put('/subscription-tiers', CreatorProfileController.updateSubscriptionTiers);

export { router as creatorProfileRoutes };