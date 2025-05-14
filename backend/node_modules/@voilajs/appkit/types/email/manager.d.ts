/**
 * Initializes email provider
 * @param {string} provider - Provider type ('smtp', 'ses', 'sendgrid', 'mailgun', 'mailtrap')
 * @param {Object} config - Provider configuration
 * @returns {Promise<EmailProvider>} Email provider instance
 * @throws {Error} If provider is already initialized or invalid
 */
export function initEmail(provider: string, config?: any): Promise<EmailProvider>;
/**
 * Gets current email instance
 * @returns {EmailProvider} Email provider instance
 * @throws {Error} If email is not initialized
 */
export function getEmail(): EmailProvider;
/**
 * Sends an email
 * @param {string|Array<string>} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} [options] - Email options
 * @returns {Promise<Object>} Send result
 */
export function sendEmail(to: string | Array<string>, subject: string, html: string, options?: any): Promise<any>;
/**
 * Sends a templated email
 * @param {string|Array<string>} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} template - Template string
 * @param {Object} [data] - Template data
 * @param {Object} [options] - Email options
 * @returns {Promise<Object>} Send result
 */
export function sendTemplatedEmail(to: string | Array<string>, subject: string, template: string, data?: any, options?: any): Promise<any>;
