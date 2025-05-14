/**
 * @voilajs/appkit - Mailtrap email provider (for testing)
 * @module @voilajs/appkit/email/providers/mailtrap
 */

import { SMTPProvider } from './smtp.js';

/**
 * Mailtrap email provider for testing
 * @extends SMTPProvider
 */
export class MailtrapProvider extends SMTPProvider {
  /**
   * Creates a new Mailtrap provider instance with default settings
   * @param {Object} config - Provider configuration
   * @param {Object} [config.auth] - Auth credentials object
   * @param {string} [config.auth.user] - Mailtrap username
   * @param {string} [config.auth.pass] - Mailtrap password
   * @param {string} [config.username] - Alternative way to provide username
   * @param {string} [config.password] - Alternative way to provide password
   * @param {number} [config.port=2525] - Mailtrap SMTP port
   */
  constructor(config = {}) {
    // Set Mailtrap SMTP defaults
    const mailtrapConfig = {
      host: 'smtp.mailtrap.io',
      port: config.port || 2525,
      auth: {
        user: config.auth?.user || config.username,
        pass: config.auth?.pass || config.password,
      },
      ...config,
    };

    super(mailtrapConfig);
  }

  /**
   * Validates Mailtrap configuration
   * @throws {Error} If Mailtrap credentials are missing
   */
  validateConfig() {
    if (!this.config.auth?.user || !this.config.auth?.pass) {
      throw new Error('Mailtrap username and password are required');
    }
  }

  /**
   * Sends an email via Mailtrap
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result with additional Mailtrap info
   * @throws {Error} If send fails
   */
  async send(options) {
    // Add test mode indicator
    const emailOptions = { ...options };

    if (!emailOptions.headers) {
      emailOptions.headers = {};
    }

    // Add Mailtrap-specific headers
    emailOptions.headers['X-Mailtrap-Test'] = 'true';

    // Send email using parent SMTP implementation
    const result = await super.send(emailOptions);

    return {
      ...result,
      testMode: true,
      info: 'Email sent to Mailtrap inbox for testing',
      inboxUrl: `https://mailtrap.io/inboxes/${this.config.inboxId || ''}`,
    };
  }
}
