/**
 * @voilajs/appkit - Email template engine
 * @module @voilajs/appkit/email/templates
 */
/**
 * Simple template renderer
 * Replaces {{variable}} with data values
 * @param {string} template - Template string
 * @param {Object} [data] - Template data
 * @returns {Promise<string>} Rendered template
 */
export function renderTemplate(template: string, data?: any): Promise<string>;
