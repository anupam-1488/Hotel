/**
 * @voilajs/appkit - SMTP email provider
 * @module @voilajs/appkit/email/providers/smtp
 */

import nodemailer from 'nodemailer';
import { EmailProvider } from './base.js';

/**
 * SMTP email provider for sending emails via SMTP server
 * @extends EmailProvider
 */
export class SMTPProvider extends EmailProvider {
  /**
   * Validates SMTP configuration
   * @throws {Error} If required SMTP configuration is missing
   */
  validateConfig() {
    if (!this.config.host) {
      throw new Error('SMTP host is required');
    }

    // Only validate auth if auth is not explicitly set to false
    if (
      this.config.auth !== false &&
      (!this.config.auth?.user || !this.config.auth?.pass)
    ) {
      throw new Error(
        'SMTP authentication credentials are required unless auth is disabled'
      );
    }
  }

  /**
   * Initializes the SMTP connection
   * @returns {Promise<void>}
   * @throws {Error} If connection fails
   */
  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port || 587,
        secure: this.config.secure || false,
        auth: this.config.auth === false ? null : this.config.auth,
        pool: this.config.pool || false,
        maxConnections: this.config.maxConnections || 5,
        tls: this.config.tls || {},
      });

      // Verify connection if not explicitly disabled
      if (this.config.verifyConnection !== false) {
        await this.transporter.verify();
      }
    } catch (error) {
      throw new Error(`Failed to initialize SMTP connection: ${error.message}`);
    }
  }

  /**
   * Closes the SMTP connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
    }
  }

  /**
   * Sends an email via SMTP
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject
   * @param {string} [options.html] - HTML content
   * @param {string} [options.text] - Plain text content
   * @param {string} [options.from] - Sender email address
   * @param {string|string[]} [options.cc] - CC recipient(s)
   * @param {string|string[]} [options.bcc] - BCC recipient(s)
   * @param {string} [options.replyTo] - Reply-to email address
   * @param {Object[]} [options.attachments] - Email attachments
   * @param {Object} [options.headers] - Custom email headers
   * @returns {Promise<Object>} Send result with messageId and response info
   * @throws {Error} If send fails
   */
  async send(options) {
    this.validateEmailOptions(options);

    const mailOptions = {
      from: options.from || this.config.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
      headers: options.headers,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        response: result.response,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
