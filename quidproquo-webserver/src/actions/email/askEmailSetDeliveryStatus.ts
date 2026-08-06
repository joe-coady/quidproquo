import { createActionRequester } from 'quidproquo-core';
import { EmailActionType } from './EmailActionType';
import { EmailDeliveryStatus } from './EmailDeliveryStatus';

export const askEmailSetDeliveryStatus = createActionRequester<void>()({
  actionType: EmailActionType.SetDeliveryStatus,
  getPayload: (messageId: string, deliveryStatus: EmailDeliveryStatus, reason?: string) => ({ messageId, deliveryStatus, reason }),
});
