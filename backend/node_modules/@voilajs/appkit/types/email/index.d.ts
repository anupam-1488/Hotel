export function initEmail(provider: any, config?: {}): Promise<SMTPProvider | SESProvider | SendGridProvider | MailgunProvider>;
export function sendEmail(to: any, subject: any, html: any, options?: {}): Promise<any>;
export function sendTemplatedEmail(to: any, subject: any, template: any, data: any, options?: {}): Promise<any>;
export function getProvider(): any;
import { SMTPProvider } from './providers/smtp.js';
import { SESProvider } from './providers/ses.js';
import { SendGridProvider } from './providers/sendgrid.js';
import { MailgunProvider } from './providers/mailgun.js';
