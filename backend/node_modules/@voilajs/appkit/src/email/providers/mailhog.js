/**
 * @voilajs/appkit - MailHog email provider (for testing)
 * @module @voilajs/appkit/email/providers/mailhog
 */

import { SMTPProvider } from './smtp.js';

/**
 * MailHog email provider for local development and testing
 * @extends SMTPProvider
 */
export class MailHogProvider extends SMTPProvider {
  /**
   * Creates a new MailHog provider instance with default settings
   * @param {Object} config - Provider configuration
   * @param {string} [config.host='localhost'] - MailHog host
   * @param {number} [config.port=1025] - MailHog SMTP port
   * @param {string} [config.defaultFrom] - Default sender email
   */
  constructor(config = {}) {
    // Set MailHog SMTP defaults
    const mailhogConfig = {
      host: config.host || 'localhost',
      port: config.port || 1025,
      secure: false,
      auth: false, // MailHog doesn't require auth
      tls: {
        rejectUnauthorized: false,
      },
      ...config,
    };

    super(mailhogConfig);
  }

  /**
   * MailHog doesn't need specific validation
   */
  validateConfig() {
    // MailHog works with defaults, no validation needed
  }

  /**
   * Sends an email to MailHog
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result with additional MailHog info
   * @throws {Error} If send fails
   */
  async send(options) {
    const result = await super.send(options);
    const webPort = this.config.webPort || 8025;

    return {
      ...result,
      testMode: true,
      info: 'Email sent to MailHog for testing',
      webUI: `http://${this.config.host || 'localhost'}:${webPort}`,
    };
  }
}
