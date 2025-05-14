/**
 * SMTP email provider
 * @extends EmailProvider
 */
export class SMTPProvider extends EmailProvider {
    transporter: any;
}
import { EmailProvider } from './base.js';
