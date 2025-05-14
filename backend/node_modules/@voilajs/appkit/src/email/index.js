/**
 * @voilajs/appkit - Email module
 * @module @voilajs/appkit/email
 */

import { SMTPProvider } from './providers/smtp.js';
import { SESProvider } from './providers/ses.js';
import { SendGridProvider } from './providers/sendgrid.js';
import { MailgunProvider } from './providers/mailgun.js';
import { MailHogProvider } from './providers/mailhog.js';
import { MailtrapProvider } from './providers/mailtrap.js';
import { renderTemplate } from './templates.js';

// Provider mapping for easy access
const PROVIDERS = {
  smtp: SMTPProvider,
  ses: SESProvider,
  sendgrid: SendGridProvider,
  mailgun: MailgunProvider,
  mailhog: MailHogProvider,
  mailtrap: MailtrapProvider,
};

// Store current provider instance
let emailProvider = null;

/**
 * Initializes an email provider
 * @param {string} provider - Provider type ('smtp', 'ses', 'sendgrid', 'mailgun', 'mailhog', 'mailtrap')
 * @param {Object} config - Provider configuration
 * @returns {Promise<Object>} Initialized provider instance
 * @throws {Error} If provider type is invalid or initialization fails
 *
 * @example
 * // Initialize SMTP provider
 * const smtp = await initEmail('smtp', {
 *   host: 'smtp.example.com',
 *   port: 587,
 *   auth: {
 *     user: 'username',
 *     pass: 'password'
 *   },
 *   defaultFrom: 'sender@example.com'
 * });
 *
 * @example
 * // Initialize SendGrid provider
 * const sendgrid = await initEmail('sendgrid', {
 *   apiKey: 'your-sendgrid-api-key',
 *   defaultFrom: 'sender@example.com'
 * });
 */
export async function initEmail(provider, config = {}) {
  try {
    // Check if provider is already initialized
    if (emailProvider) {
      await closeEmail();
    }

    // Normalize provider name
    const providerType = provider.toLowerCase();

    // Get provider class
    const ProviderClass = PROVIDERS[providerType];
    if (!ProviderClass) {
      throw new Error(`Unknown email provider: ${provider}`);
    }

    // Create provider instance
    emailProvider = new ProviderClass(config);

    // Initialize provider
    await emailProvider.initialize();

    return emailProvider;
  } catch (error) {
    emailProvider = null;
    throw new Error(`Failed to initialize email provider: ${error.message}`);
  }
}

/**
 * Closes the current email provider connection
 * @returns {Promise<void>}
 */
export async function closeEmail() {
  if (emailProvider) {
    try {
      await emailProvider.close();
    } catch (error) {
      console.error(`Error closing email provider: ${error.message}`);
    }
    emailProvider = null;
  }
}

/**
 * Gets the current email provider instance
 * @returns {Object} Email provider instance
 * @throws {Error} If no provider has been initialized
 */
export function getEmailProvider() {
  if (!emailProvider) {
    throw new Error('Email provider not initialized. Call initEmail() first.');
  }
  return emailProvider;
}

/**
 * Sends an email
 * @param {string|string[]} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} [options={}] - Additional email options
 * @param {string} [options.from] - Sender email (overrides default)
 * @param {string} [options.text] - Plain text version
 * @param {string|string[]} [options.cc] - CC recipients
 * @param {string|string[]} [options.bcc] - BCC recipients
 * @param {string} [options.replyTo] - Reply-to address
 * @param {Object[]} [options.attachments] - Email attachments
 * @param {Object} [options.headers] - Custom email headers
 * @returns {Promise<Object>} Send result with status and provider-specific info
 * @throws {Error} If provider not initialized or send fails
 *
 * @example
 * // Send a simple email
 * const result = await sendEmail(
 *   'recipient@example.com',
 *   'Hello World',
 *   '<p>This is a test email</p>'
 * );
 *
 * @example
 * // Send an email with attachments
 * const result = await sendEmail(
 *   ['user1@example.com', 'user2@example.com'],
 *   'Email with attachment',
 *   '<p>Please see attached file</p>',
 *   {
 *     from: 'sender@example.com',
 *     cc: 'manager@example.com',
 *     attachments: [
 *       {
 *         filename: 'report.pdf',
 *         content: fs.readFileSync('./report.pdf')
 *       }
 *     ]
 *   }
 * );
 */
export async function sendEmail(to, subject, html, options = {}) {
  const provider = getEmailProvider();

  return provider.send({
    to,
    subject,
    html,
    ...options,
  });
}

/**
 * Sends a templated email
 * @param {string|string[]} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} template - HTML template with variables
 * @param {Object} [data={}] - Template data for variable replacement
 * @param {Object} [options={}] - Additional email options
 * @returns {Promise<Object>} Send result
 * @throws {Error} If provider not initialized, template rendering fails, or send fails
 *
 * @example
 * // Send templated email
 * const template = `
 *   <h1>Hello {{name}}</h1>
 *   <p>Welcome to our service!</p>
 *   {{#if showDetails}}
 *     <p>Your account details:</p>
 *     <ul>
 *       {{#each features}}
 *         <li>{{this}}</li>
 *       {{/each}}
 *     </ul>
 *   {{/if}}
 * `;
 *
 * const result = await sendTemplatedEmail(
 *   'user@example.com',
 *   'Welcome to Our Service',
 *   template,
 *   {
 *     name: 'John Doe',
 *     showDetails: true,
 *     features: ['Email hosting', 'Cloud storage', '24/7 support']
 *   }
 * );
 */
export async function sendTemplatedEmail(
  to,
  subject,
  template,
  data = {},
  options = {}
) {
  try {
    const html = await renderTemplate(template, data);
    return sendEmail(to, subject, html, options);
  } catch (error) {
    throw new Error(`Failed to send templated email: ${error.message}`);
  }
}
