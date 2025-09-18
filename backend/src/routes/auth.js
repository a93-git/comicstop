import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate, authSchemas } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter, signupLimiter, forgotPasswordLimiter } from '../middleware/rateLimiters.js';
import { AuthService } from '../services/authService.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - username
 *               - password
 *               - termsAccepted
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 description: Email address or phone number
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               password:
 *                 type: string
 *                 minLength: 6
 *               termsAccepted:
 *                 type: boolean
 *                 description: Must be true to proceed
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/signup', signupLimiter, validate(authSchemas.signup), AuthController.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with email, username, or phone
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address, username, or phone number
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, validate(authSchemas.login), AuthController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset requested
 */
router.post('/forgot-password', forgotPasswordLimiter, validate(authSchemas.forgotPassword), AuthController.forgotPassword);

/**
 * @swagger
 * /auth/forgot-password/phone:
 *   post:
 *     summary: Request a password reset PIN to phone
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Registered phone number
 *     responses:
 *       200:
 *         description: PIN requested
 */
router.post('/forgot-password/phone', forgotPasswordLimiter, validate(authSchemas.forgotPasswordPhone), AuthController.forgotPasswordPhone);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validate(authSchemas.resetPassword), AuthController.resetPassword);

/**
 * @swagger
 * /auth/reset-password/phone:
 *   post:
 *     summary: Reset password using a phone PIN
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, pin, password]
 *             properties:
 *               phone:
 *                 type: string
 *               pin:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired PIN
 */
router.post('/reset-password/phone', validate(authSchemas.resetPasswordWithPin), AuthController.resetPasswordPhone);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', requireAuth, AuthController.profile);

/**
 * @swagger
 * /auth/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/settings', requireAuth, AuthController.settings);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', requireAuth, AuthController.logout);

// Email verification (local/dev-friendly)
router.post('/verify-email', requireAuth, async (req, res) => {
	try {
		const user = await AuthService.setEmailVerified(req.user.id)
		res.json({ success: true, data: { user } })
	} catch (e) {
		res.status(400).json({ success: false, message: e.message })
	}
})

// Enable/disable creator mode (legacy)
router.post('/creator-mode', requireAuth, async (req, res) => {
	try {
		const { enable } = req.body
		const user = await AuthService.setCreator(req.user.id, enable !== false)
		res.json({ success: true, data: { user } })
	} catch (e) {
		res.status(400).json({ success: false, message: e.message })
	}
})

// Enable/disable CreatorHub with retention and notifications
router.post('/creator-hub', requireAuth, async (req, res) => {
	try {
		const { enabled } = req.body
		
		// Validate enabled parameter
		if (enabled === undefined) {
			return res.status(400).json({ 
				success: false, 
				message: 'enabled parameter is required' 
			})
		}
		
		if (typeof enabled !== 'boolean') {
			return res.status(400).json({ 
				success: false, 
				message: 'enabled parameter must be a boolean' 
			})
		}
		
		const user = await AuthService.setCreatorHub(req.user.id, enabled)
		res.json({ 
			success: true, 
			data: { user },
			message: enabled ? 'CreatorHub enabled successfully' : 'CreatorHub disabled. Data will be retained for 6 months.'
		})
	} catch (e) {
		res.status(400).json({ success: false, message: e.message })
	}
})

// Clean up expired CreatorHub data (admin endpoint)
router.post('/cleanup-expired-creator-data', requireAuth, async (req, res) => {
	try {
		// TODO: Add admin role check here
		const result = await AuthService.cleanupExpiredCreatorData()
		res.json({ 
			success: true, 
			data: result,
			message: `Cleaned up ${result.deletedCount} expired creator profiles`
		})
	} catch (e) {
		res.status(500).json({ success: false, message: e.message })
	}
})

// Delete account
router.delete('/me', requireAuth, async (req, res) => {
	try {
		await AuthService.deleteAccount(req.user.id)
		res.json({ success: true, message: 'Account deleted. Please remove client token.', data: { loggedOut: true } })
	} catch (e) {
		res.status(400).json({ success: false, message: e.message })
	}
})

// Profile updates (single-field endpoints)
router.patch('/profile/username', requireAuth, validate(authSchemas.updateUsername), AuthController.updateUsername)
router.patch('/profile/email', requireAuth, validate(authSchemas.updateEmail), AuthController.updateEmail)
router.patch('/profile/phone', requireAuth, validate(authSchemas.updatePhone), AuthController.updatePhone)
router.patch('/profile/password', requireAuth, validate(authSchemas.updatePassword), AuthController.updatePassword)

// Profile update unified endpoint (exactly one field allowed)
router.patch('/profile', requireAuth, validate(authSchemas.updateProfileOneOf), AuthController.updateProfileOneOf)

// Profile picture upload
router.patch('/profile/picture', requireAuth, upload.single('profilePicture'), AuthController.updateProfilePicture)

export default router;