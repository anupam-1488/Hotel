/**
 * @voilajs/appkit - AWS SES email provider
 * @module @voilajs/appkit/email/providers/ses
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EmailProvider } from './base.js';

/**
 * AWS SES email provider
 * @extends EmailProvider
 */
export class SESProvider extends EmailProvider {
  /**
   * Validates SES configuration
   * @throws {Error} If required SES configuration is missing
   */
  validateConfig() {
    if (!this.config.region) {
      throw new Error('AWS region is required for SES');
    }
  }

  /**
   * Initializes the SES client
   * @returns {Promise<void>}
   */
  async initialize() {
    const clientConfig = {
      region: this.config.region,
    };

    if (this.config.credentials) {
      clientConfig.credentials = this.config.credentials;
    }

    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
    }

    this.client = new SESClient(clientConfig);
  }

  /**
   * Closes the SES client
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client) {
      this.client.destroy();
    }
  }

  /**
   * Sends an email via AWS SES
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject
   * @param {string} [options.html] - HTML content
   * @param {string} [options.text] - Plain text content
   * @param {string} [options.from] - Sender email address
   * @param {string|string[]} [options.cc] - CC recipient(s)
   * @param {string|string[]} [options.bcc] - BCC recipient(s)
   * @param {string|string[]} [options.replyTo] - Reply-to email address(es)
   * @param {string} [options.configurationSet] - SES configuration set name
   * @returns {Promise<Object>} Send result with messageId and SES response
   * @throws {Error} If send fails
   */
  async send(options) {
    this.validateEmailOptions(options);

    const toAddresses = this.normalizeEmails(options.to);
    const ccAddresses = options.cc
      ? this.normalizeEmails(options.cc)
      : undefined;
    const bccAddresses = options.bcc
      ? this.normalizeEmails(options.bcc)
      : undefined;
    const replyToAddresses = options.replyTo
      ? this.normalizeEmails(options.replyTo)
      : undefined;

    const params = {
      Source: options.from || this.config.defaultFrom,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses,
        BccAddresses: bccAddresses,
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {},
      },
      ReplyToAddresses: replyToAddresses,
    };

    // Add configuration set if specified
    if (options.configurationSet || this.config.configurationSet) {
      params.ConfigurationSetName =
        options.configurationSet || this.config.configurationSet;
    }

    // Add HTML content if provided
    if (options.html) {
      params.Message.Body.Html = {
        Data: options.html,
        Charset: 'UTF-8',
      };
    }

    // Add text content if provided
    if (options.text) {
      params.Message.Body.Text = {
        Data: options.text,
        Charset: 'UTF-8',
      };
    }

    try {
      const command = new SendEmailCommand(params);
      const result = await this.client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        result,
      };
    } catch (error) {
      throw new Error(`Failed to send email via SES: ${error.message}`);
    }
  }
}
