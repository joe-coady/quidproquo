import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { EmailActionType } from './EmailActionType';
import { EmailDeliveryStatus } from './EmailDeliveryStatus';

// Payload
export type EmailSetDeliveryStatusActionPayload = {
  messageId: string;
  deliveryStatus: EmailDeliveryStatus;

  // Provider detail: drop reason, SMTP response for deferrals, bounce text
  reason?: string;
};

// Action
export interface EmailSetDeliveryStatusAction extends Action<EmailSetDeliveryStatusActionPayload> {
  type: EmailActionType.SetDeliveryStatus;
  payload: EmailSetDeliveryStatusActionPayload;
}

// Function Types
export type EmailSetDeliveryStatusActionProcessor = ActionProcessor<EmailSetDeliveryStatusAction, void>;
export type EmailSetDeliveryStatusActionRequester = ActionRequester<EmailSetDeliveryStatusAction, void>;
