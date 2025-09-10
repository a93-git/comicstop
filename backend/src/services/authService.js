import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import { Op } from 'sequelize';

/**
 * Authentication service for user signup and login
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async signup(userData) {
    const { email, username, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      throw new Error(`User with this ${field} already exists`);
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  }

  /**
   * Get user profile
   */
  static async getProfile(userId) {
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }

    return user;
  }
}