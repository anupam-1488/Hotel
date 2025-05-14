/**
 * @voilajs/appkit - SendGrid email provider
 * @module @voilajs/appkit/email/providers/sendgrid
 */

import sgMail from '@sendgrid/mail';
import { EmailProvider } from './base.js';

/**
 * SendGrid email provider
 * @extends EmailProvider
 */
export class SendGridProvider extends EmailProvider {
  /**
   * Validates SendGrid configuration
   * @throws {Error} If SendGrid API key is missing
   */
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
  }

  /**
   * Initializes the SendGrid client
   * @returns {Promise<void>}
   */
  async initialize() {
    sgMail.setApiKey(this.config.apiKey);

    // Set timeout if provided
    if (this.config.timeout) {
      sgMail.setTimeout(this.config.timeout);
    }
  }

  /**
   * Sends an email via SendGrid
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
   * @param {string[]} [options.categories] - SendGrid email categories
   * @param {Object} [options.customArgs] - SendGrid custom arguments
   * @param {string} [options.templateId] - SendGrid template ID
   * @param {Object} [options.dynamicTemplateData] - Data for SendGrid dynamic templates
   * @returns {Promise<Object>} Send result with messageId and status info
   * @throws {Error} If send fails
   */
  async send(options) {
    this.validateEmailOptions(options);

    const msg = {
      from: options.from || this.config.defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments?.map((att) => ({
        content:
          typeof att.content === 'string'
            ? att.content
            : att.content.toString('base64'),
        filename: att.filename,
        type: att.type || 'application/octet-stream',
        disposition: att.disposition || 'attachment',
      })),
      headers: options.headers,
      customArgs: options.customArgs,
      categories: options.categories,
    };

    // Handle SendGrid templates
    if (options.templateId) {
      msg.templateId = options.templateId;
      msg.dynamicTemplateData = options.dynamicTemplateData;
    }

    try {
      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        response: response.body,
      };
    } catch (error) {
      const errorMessage =
        error.response?.body?.errors?.[0]?.message || error.message;
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
