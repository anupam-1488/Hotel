/**
 * AWS SES email provider
 * @extends EmailProvider
 */
export class SESProvider extends EmailProvider {
    client: SESClient;
}
import { EmailProvider } from './base.js';
import { SESClient } from '@aws-sdk/client-ses';
