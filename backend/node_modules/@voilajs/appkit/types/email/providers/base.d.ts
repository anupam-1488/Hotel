/**
 * @voilajs/appkit - Base email provider
 * @module @voilajs/appkit/email/providers/base
 */
/**
 * Base email provider interface
 */
export class EmailProvider {
    constructor(config?: {});
    config: {};
    /**
     * Validates provider configuration
     * @throws {Error} If configuration is invalid
     */
    validateConfig(): void;
    /**
     * Initializes the email provider
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Sends an email
     * @param {Object} options - Email options
     * @returns {Promise<Object>} Send result
     */
    send(options: any): Promise<any>;
    /**
     * Validates email options
     * @param {Object} options - Email options
     * @throws {Error} If options are invalid
     */
    validateEmailOptions(options: any): void;
    /**
     * Normalizes email addresses
     * @param {string|Array<string>} emails - Email address(es)
     * @returns {Array<string>} Normalized email array
     */
    normalizeEmails(emails: string | Array<string>): Array<string>;
}
