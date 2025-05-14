/**
 * @voilajs/appkit - Base email provider
 * @module @voilajs/appkit/email/providers/base
 */

/**
 * Base email provider interface that all other providers extend
 * @class
 */
export class EmailProvider {
  /**
   * Creates a new email provider instance
   * @param {Object} config - Provider configuration
   * @param {string} [config.defaultFrom] - Default sender email address
   */
  constructor(config = {}) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validates provider configuration
   * @throws {Error} If configuration is invalid
   */
  validateConfig() {
    // Override in subclasses with provider-specific validation
  }

  /**
   * Initializes the email provider
   * @returns {Promise<void>}
   */
  async initialize() {
    // Override in subclasses if needed
  }

  /**
   * Closes the email provider connection
   * @returns {Promise<void>}
   */
  async close() {
    // Override in subclasses if needed
  }

  /**
   * Sends an email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject
   * @param {string} [options.html] - HTML content
   * @param {string} [options.text] - Plain text content (used if html not provided)
   * @param {string} [options.from] - Sender email address (overrides default)
   * @param {string|string[]} [options.cc] - CC recipient(s)
   * @param {string|string[]} [options.bcc] - BCC recipient(s)
   * @param {string} [options.replyTo] - Reply-to email address
   * @param {Object[]} [options.attachments] - Email attachments
   * @param {Buffer|string} options.attachments[].content - Attachment content
   * @param {string} options.attachments[].filename - Attachment filename
   * @param {string} [options.attachments[].type] - Attachment MIME type
   * @param {Object} [options.headers] - Custom email headers
   * @returns {Promise<Object>} Send result with success flag and provider-specific info
   * @throws {Error} If send fails or options are invalid
   */
  async send(options) {
    throw new Error('send() must be implemented by subclass');
  }

  /**
   * Validates email options
   * @param {Object} options - Email options
   * @throws {Error} If options are invalid
   */
  validateEmailOptions(options) {
    if (!options.to) {
      throw new Error('Recipient email (to) is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.html && !options.text) {
      throw new Error('Email content (html or text) is required');
    }
  }

  /**
   * Normalizes email addresses to an array
   * @param {string|string[]} emails - Email address(es)
   * @returns {string[]} Normalized email array
   * @throws {Error} If email format is invalid
   */
  normalizeEmails(emails) {
    if (typeof emails === 'string') {
      return [emails];
    }
    if (Array.isArray(emails)) {
      return emails;
    }
    throw new Error(
      'Invalid email format. Must be string or array of strings.'
    );
  }
}
