import nodemailer from 'nodemailer';

/**
 * Email service for sending notifications
 * In production, configure with real SMTP credentials
 */
class EmailService {
  constructor() {
    // For development, use ethereal or console logging
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: create test account or use console
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (error) {
        console.warn('Failed to create test email account, using console logging');
        this.transporter = null;
      }
    }
  }

  /**
   * Send CreatorHub enabled notification email
   */
  async sendCreatorHubEnabledEmail(user) {
    const subject = 'CreatorHub Enabled - Welcome to ComicStop Creators!';
    const html = `
      <h2>Welcome to CreatorHub!</h2>
      <p>Hi ${user.username},</p>
      
      <p>Your CreatorHub has been successfully enabled on ComicStop. You can now:</p>
      <ul>
        <li>Upload and publish your comics</li>
        <li>Create and manage series</li>
        <li>Customize your creator profile</li>
        <li>Track analytics and engagement</li>
      </ul>
      
      <p>Get started by visiting your <a href="${this.getBaseUrl()}/creator/dashboard">Creator Dashboard</a>.</p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Happy creating!</p>
      <p>The ComicStop Team</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send CreatorHub disabled notification email
   */
  async sendCreatorHubDisabledEmail(user) {
    const subject = 'CreatorHub Disabled - Data Retention Information';
    const html = `
      <h2>CreatorHub Disabled</h2>
      <p>Hi ${user.username},</p>
      
      <p>Your CreatorHub has been disabled as requested. Here's what you need to know:</p>
      
      <h3>📋 Data Retention Policy</h3>
      <ul>
        <li><strong>Your creator profile and content are preserved for 6 months</strong></li>
        <li>You can re-enable CreatorHub anytime during this period without data loss</li>
        <li>After 6 months, your creator profile data will be permanently deleted</li>
        <li>Your published comics will remain public but cannot be edited</li>
      </ul>
      
      <h3>🔄 Re-enabling CreatorHub</h3>
      <p>To re-enable CreatorHub, simply go to your <a href="${this.getBaseUrl()}/settings">Account Settings</a> and toggle CreatorHub back on.</p>
      
      <h3>📅 Important Dates</h3>
      <p><strong>Disabled on:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Data deletion scheduled for:</strong> ${new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      
      <p>If you have any questions about this change, please contact our support team.</p>
      
      <p>Thank you for being part of the ComicStop community.</p>
      <p>The ComicStop Team</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send email helper
   */
  async sendEmail(to, subject, html) {
    if (!to) {
      console.warn('No email address provided for notification');
      return false;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@comicstop.com',
      to,
      subject,
      html,
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        
        // In development with Ethereal, log preview URL
        if (process.env.NODE_ENV !== 'production' && info.messageId) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
        
        return true;
      } else {
        // Fallback: log to console
        console.log('Email notification (console mode):');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
        return true;
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Get base URL for links in emails
   */
  getBaseUrl() {
    return process.env.CLIENT_URL || 'http://localhost:5173';
  }
}

export const emailService = new EmailService();