
import { type WebhookPayload } from '../schema';

export declare function processWebhook(webhookUrl: string, payload: WebhookPayload): Promise<{ success: boolean; message: string }>;
