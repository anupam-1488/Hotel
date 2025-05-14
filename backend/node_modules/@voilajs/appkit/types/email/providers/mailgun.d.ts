/**
 * Mailgun email provider
 * @extends EmailProvider
 */
export class MailgunProvider extends EmailProvider {
    client: import("mailgun.js/Interfaces/index.js").IMailgunClient;
}
import { EmailProvider } from './base.js';
