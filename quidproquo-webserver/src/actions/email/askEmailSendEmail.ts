import { createActionRequester } from 'quidproquo-core';

import { EmailActionType } from './EmailActionType';
import { EmailSendEmailActionPayload } from './EmailSendEmailActionTypes';

export const askEmailSendEmail = createActionRequester<string>()({
  actionType: EmailActionType.SendEmail,
  errorTypes: ['MessageRejected', 'SenderNotVerified', 'AccountSuspended', 'SendingPaused', 'Throttled', 'LimitExceeded', 'BadRequest'],
  getPayload: (payload: EmailSendEmailActionPayload) => payload,
});
