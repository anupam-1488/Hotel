/**
 * @voilajs/appkit - Mailgun email provider
 * @module @voilajs/appkit/email/providers/mailgun
 */

import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailProvider } from './base.js';

/**
 * Mailgun email provider
 * @extends EmailProvider
 */
export class MailgunProvider extends EmailProvider {
  /**
   * Validates Mailgun configuration
   * @throws {Error} If required Mailgun configuration is missing
   */
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Mailgun API key is required');
    }
    if (!this.config.domain) {
      throw new Error('Mailgun domain is required');
    }
  }

  /**
   * Initializes the Mailgun client
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      const mailgun = new Mailgun(formData);
      this.client = mailgun.client({
        username: 'api',
        key: this.config.apiKey,
        url: this.config.url || 'https://api.mailgun.net',
      });
    } catch (error) {
      throw new Error(`Failed to initialize Mailgun client: ${error.message}`);
    }
  }

  /**
   * Sends an email via Mailgun
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
   * @param {Object} [options.variables] - Mailgun template variables
   * @param {string[]} [options.tags] - Mailgun email tags
   * @param {boolean} [options.tracking=true] - Enable Mailgun tracking
   * @param {boolean|string} [options.trackingClicks] - Track clicks (true, false, or 'htmlonly')
   * @param {boolean} [options.trackingOpens] - Track opens
   * @returns {Promise<Object>} Send result with messageId and Mailgun response
   * @throws {Error} If send fails
   */
  async send(options) {
    this.validateEmailOptions(options);

    const messageData = {
      from: options.from || this.config.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(', ')
          : options.cc
        : undefined,
      bcc: options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(', ')
          : options.bcc
        : undefined,
      'h:Reply-To': options.replyTo,
      'o:tag': options.tags,
      'o:tracking': options.tracking !== false,
      'o:tracking-clicks': options.trackingClicks,
      'o:tracking-opens': options.trackingOpens,
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      messageData.attachment = options.attachments.map((att) => ({
        data: att.content,
        filename: att.filename,
        contentType: att.type || undefined,
      }));
    }

    // Add custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        messageData[`h:${key}`] = value;
      });
    }

    // Add template variables
    if (options.variables) {
      Object.entries(options.variables).forEach(([key, value]) => {
        messageData[`v:${key}`] =
          typeof value === 'object' ? JSON.stringify(value) : value;
      });
    }

    try {
      const result = await this.client.messages.create(
        this.config.domain,
        messageData
      );

      return {
        success: true,
        messageId: result.id,
        response: result,
      };
    } catch (error) {
      throw new Error(`Failed to send email via Mailgun: ${error.message}`);
    }
  }
}
