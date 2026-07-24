import { EmailActionType } from './EmailActionType';
import { EmailDeliveryStatus } from './EmailDeliveryStatus';
import { EmailSetDeliveryStatusActionRequester } from './EmailSetDeliveryStatusActionTypes';

// Records a delivery status change for a previously sent email. The action itself
// does nothing at runtime: its meaning is the log entry, which the admin action
// search folds into the email's entity via the messageId link key.
export function* askEmailSetDeliveryStatus(
  messageId: string,
  deliveryStatus: EmailDeliveryStatus,
  reason?: string,
): EmailSetDeliveryStatusActionRequester {
  return yield {
    type: EmailActionType.SetDeliveryStatus,
    payload: {
      messageId,
      deliveryStatus,
      reason,
    },
  };
}
