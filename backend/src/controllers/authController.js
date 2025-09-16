import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register a new user
   * POST /auth/signup
   */
  static signup = asyncHandler(async (req, res) => {
    const result = await AuthService.signup(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  /**
   * Login user
   * POST /auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const result = await AuthService.login(identifier, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.requestPasswordReset(email);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent', data: result });
  });

  /**
   * Request password reset via phone PIN
   * POST /auth/forgot-password/phone
   */
  static forgotPasswordPhone = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const result = await AuthService.requestPasswordResetByPhone(phone);
    res.json({ success: true, message: 'If that phone exists, a PIN has been sent', data: result });
  });

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    res.json({ success: true, message: 'Password has been reset', data: result });
  });

  /**
   * Reset password using phone PIN
   * POST /auth/reset-password/phone
   */
  static resetPasswordPhone = asyncHandler(async (req, res) => {
    const { phone, pin, password } = req.body;
    const result = await AuthService.resetPasswordWithPin(phone, pin, password);
    res.json({ success: true, message: 'Password has been reset', data: result });
  });

  /**
   * Get user profile
   * GET /auth/profile
   */
  static profile = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user.id);

    res.json({
      success: true,
      data: {
        user,
      },
    });
  });

  /**
   * Get user settings
   * GET /auth/settings
   */
  static settings = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user.id);

    // Return user settings - combining profile data with specific settings
    const settings = {
      username: user.username,
      email: user.email,
      joinDate: user.createdAt,
      isCreator: user.isCreator || false,
      emailVerified: user.emailVerified || false,
      theme: user.preferences?.theme || 'auto',
      readingPreferences: {
        showDialogues: user.preferences?.showDialogues ?? true,
        enableClickNavigation: user.preferences?.enableClickNavigation ?? true,
      },
      notifications: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? false,
      }
    };

    res.json({
      success: true,
      data: {
        settings,
      },
    });
  });

  /**
   * Logout user (client-side token removal)
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    });
  });

  /**
   * PATCH /auth/profile/username
   */
  static updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const user = await AuthService.updateUsername(req.user.id, username);
    res.json({ success: true, data: { user } });
  });

  /**
   * PATCH /auth/profile/email
   */
  static updateEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await AuthService.updateEmail(req.user.id, email);
    res.json({ success: true, data: { user } });
  });

  /**
   * PATCH /auth/profile/phone
   */
  static updatePhone = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const user = await AuthService.updatePhone(req.user.id, phone);
    res.json({ success: true, data: { user } });
  });

  /**
   * PATCH /auth/profile/password
   */
  static updatePassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const result = await AuthService.updatePassword(req.user.id, password);
    res.json({ success: true, data: result, message: 'Password updated' });
  });

  /**
   * PATCH /auth/profile (one field only)
   */
  static updateProfileOneOf = asyncHandler(async (req, res) => {
    const { username, email, phone, password } = req.body;
    let response;
    if (username !== undefined) {
      const user = await AuthService.updateUsername(req.user.id, username);
      response = { user };
    } else if (email !== undefined) {
      const user = await AuthService.updateEmail(req.user.id, email);
      response = { user };
    } else if (phone !== undefined) {
      const user = await AuthService.updatePhone(req.user.id, phone);
      response = { user };
    } else if (password !== undefined) {
      const result = await AuthService.updatePassword(req.user.id, password);
      response = result;
    }
    res.json({ success: true, data: response });
  });
}