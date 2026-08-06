import { EmailActionType } from './EmailActionType';
import { EmailDeliveryStatus } from './EmailDeliveryStatus';

// Payload
export type EmailSetDeliveryStatusActionPayload = {
  messageId: string;
  deliveryStatus: EmailDeliveryStatus;

  // Provider detail: drop reason, SMTP response for deferrals, bounce text
  reason?: string;
};
