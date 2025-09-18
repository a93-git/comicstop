import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { s3Service } from './s3Service.js';
import { emailService } from './emailService.js';
import { config } from '../config/index.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

/**
 * Authentication service for user signup and login
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async signup(userData) {
    const { emailOrPhone, email: emailInput, phone_number, username, password } = userData;

    // Determine source of email/phone
    let email = undefined
    let phone = undefined
    if (emailInput) {
      email = String(emailInput).trim().toLowerCase()
    } else if (phone_number) {
      phone = String(phone_number).replace(/\D+/g, '') || undefined
    } else {
      // Backward compatibility: emailOrPhone
      const raw = String(emailOrPhone || '').trim()
      const asEmail = raw.toLowerCase()
      const isEmail = /@/.test(asEmail)
      email = isEmail ? asEmail : undefined
      phone = isEmail ? undefined : raw.replace(/\D+/g, '') || undefined
    }

    // Normalize for case-insensitive checks
  const emailNorm = email?.trim().toLowerCase();
  const usernameNorm = username?.trim().toLowerCase();
  const phoneNorm = phone ? String(phone).replace(/\D+/g, '') : null;

    // Check if user already exists (email/username/phone)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          emailNorm ? { email: emailNorm } : null,
          usernameNorm ? { username: usernameNorm } : null,
          phoneNorm ? { phone: phoneNorm } : null,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      let conflictField = 'credential';
      if (emailNorm && existingUser.email === emailNorm) conflictField = 'email';
      else if (usernameNorm && existingUser.username === usernameNorm) conflictField = 'username';
      else if (phoneNorm && existingUser.phone === phoneNorm) conflictField = 'phone number';

      const err = new Error(`An account with this ${conflictField} already exists`);
      err.statusCode = 409;
      throw err;
    }

    // Create new user
    const user = await User.create({
      email: emailNorm,
      username: usernameNorm,
      phone: phoneNorm,
      password,
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  /**
   * Request password reset: generate token and expiry, store on user
   */
  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
    // For security, don't reveal if user exists. But in dev/test, we can expose the token.
    if (!user) {
      return { requested: true };
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.update({ resetPasswordToken: token, resetPasswordExpires: expires });

    // In a real app, we'd send email. Here we return token only in non-production for testing.
    const payload = { requested: true };
    if (config.nodeEnv !== 'production') {
      payload.token = token;
      payload.expiresAt = expires.toISOString();
    }
    return payload;
  }

  /**
   * Request password reset via phone PIN
   */
  static async requestPasswordResetByPhone(phoneInput) {
    const phone = String(phoneInput || '').replace(/\D+/g, '')
    if (!phone) return { requested: true }
    const user = await User.findOne({ where: { phone } })
    if (!user) return { requested: true }

    // 6-digit numeric PIN
    const pin = ('' + Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 1000 * 60 * 10) // 10 minutes
    await user.update({ resetPinCode: pin, resetPinExpires: expires })

    const payload = { requested: true }
    if (config.nodeEnv !== 'production') {
      payload.pin = pin
      payload.expiresAt = expires.toISOString()
    }
    return payload
  }

  /**
   * Reset password using phone PIN
   */
  static async resetPasswordWithPin(phoneInput, pin, newPassword) {
    const phone = String(phoneInput || '').replace(/\D+/g, '')
    const now = new Date()
    const user = await User.findOne({ where: { phone } })
    if (!user || !user.resetPinCode || !user.resetPinExpires || user.resetPinCode !== pin || user.resetPinExpires <= now) {
      const err = new Error('Invalid or expired PIN')
      err.statusCode = 400
      throw err
    }

    user.password = newPassword
    user.resetPinCode = null
    user.resetPinExpires = null
    await user.save()
    return { reset: true }
  }

  /**
   * Reset password using a token
   */
  static async resetPassword(token, newPassword) {
    const now = new Date();
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: now },
      },
    });

    if (!user) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { reset: true };
  }

  /**
   * Login user
   */
  static async login(identifier, password) {
    // Normalize identifier for flexible login
    const raw = String(identifier || '').trim();
    const asEmail = raw.toLowerCase();
    const asUsername = raw.toLowerCase();
    const asPhone = raw.replace(/\D+/g, '');

    // Determine lookup fields: email/username/phone
    const whereClauses = [];
    if (asEmail.includes('@')) whereClauses.push({ email: asEmail });
    // Allow username login if not an email-like string
    if (!asEmail.includes('@')) whereClauses.push({ username: asUsername });
    // Allow phone login if digits length >= 3
    if (asPhone.length >= 3) whereClauses.push({ phone: asPhone });

    const user = await User.findOne({
      where: { [Op.or]: whereClauses },
    });

    if (!user || !user.isActive) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
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

  /**
   * Set email verified flag for the user
   */
  static async setEmailVerified(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ isEmailVerified: true });
    return user;
  }

  /**
   * Enable creator mode
   */
  static async setCreator(userId, isCreator = true) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ isCreator });
    return user;
  }

  /**
   * Enable/disable CreatorHub with retention policy
   */
  static async setCreatorHub(userId, isEnabled = true) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const updates = {
      isCreator: isEnabled, // Legacy compatibility
      isCreatorEnabled: isEnabled,
    };

    if (isEnabled) {
      // Enabling CreatorHub
      updates.creatorDisabledAt = null; // Clear any previous disable timestamp
      await user.update(updates);
      
      // Send enable notification email
      if (user.email) {
        try {
          await emailService.sendCreatorHubEnabledEmail(user);
        } catch (error) {
          console.error('Failed to send CreatorHub enabled email:', error);
        }
      }
    } else {
      // Disabling CreatorHub
      updates.creatorDisabledAt = new Date(); // Set disable timestamp for retention
      await user.update(updates);
      
      // Send disable notification email
      if (user.email) {
        try {
          await emailService.sendCreatorHubDisabledEmail(user);
        } catch (error) {
          console.error('Failed to send CreatorHub disabled email:', error);
        }
      }
    }

    return user;
  }

  /**
   * Clean up expired CreatorHub data (older than 6 months)
   * This should be called by a scheduled job
   */
  static async cleanupExpiredCreatorData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      // Import CreatorProfile here to avoid circular dependency
      const { CreatorProfile } = await import('../models/index.js');
      
      // Find users whose CreatorHub was disabled more than 6 months ago
      const expiredUsers = await User.findAll({
        where: {
          isCreatorEnabled: false,
          creatorDisabledAt: {
            [Op.lt]: sixMonthsAgo
          }
        },
        include: [{
          model: CreatorProfile,
          as: 'creatorProfile',
          required: false
        }]
      });

      let deletedCount = 0;
      for (const user of expiredUsers) {
        if (user.creatorProfile) {
          await user.creatorProfile.destroy();
          deletedCount++;
        }
        // Clear the disabled timestamp since we've cleaned up
        await user.update({ creatorDisabledAt: null });
      }

      console.log(`Cleaned up ${deletedCount} expired CreatorProfile records`);
      return { deletedCount, expiredUsers: expiredUsers.length };
    } catch (error) {
      console.error('Error during CreatorHub data cleanup:', error);
      throw error;
    }
  }

  /**
   * Update username, enforcing uniqueness and normalization
   */
  static async updateUsername(userId, username) {
    const usernameNorm = String(username).trim().toLowerCase();
    const existing = await User.findOne({ where: { username: usernameNorm } });
    if (existing && existing.id !== userId) {
      const err = new Error('An account with this username already exists');
      err.statusCode = 409;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ username: usernameNorm });
    return user;
  }

  /**
   * Update email, enforcing uniqueness and normalization
   */
  static async updateEmail(userId, email) {
    const emailNorm = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: emailNorm } });
    if (existing && existing.id !== userId) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ email: emailNorm });
    return user;
  }

  /**
   * Update phone, enforcing uniqueness and normalization
   */
  static async updatePhone(userId, phone) {
    const phoneNorm = phone ? String(phone).replace(/\D+/g, '') : null;
    if (phoneNorm) {
      const existing = await User.findOne({ where: { phone: phoneNorm } });
      if (existing && existing.id !== userId) {
        const err = new Error('An account with this phone number already exists');
        err.statusCode = 409;
        throw err;
      }
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ phone: phoneNorm });
    return user;
  }

  /**
   * Update password
   */
  static async updatePassword(userId, password) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.password = password; // hook will hash on save
    await user.save();
    return { updated: true };
  }

  /**
   * Delete current user account
   */
  static async deleteAccount(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.destroy();
    return true;
  }

  /**
   * Update profile picture: uploads to S3 and stores key/url on user
   */
  static async updateProfilePicture(userId, file) {
    if (!file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Upload new file
    const result = await s3Service.uploadFile(file, 'profile-pictures');

    // Delete old picture if present (best-effort)
    if (user.profilePictureS3Key) {
      try {
        await s3Service.deleteFile(user.profilePictureS3Key);
      } catch (e) {
        console.warn('Failed to delete old profile picture:', e);
      }
    }

    await user.update({
      profilePictureS3Key: result.key,
      profilePictureS3Url: result.url,
    });

    return user;
  }
}