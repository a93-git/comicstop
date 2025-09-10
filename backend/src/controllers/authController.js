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
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

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
   * Logout user (client-side token removal)
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    });
  });
}