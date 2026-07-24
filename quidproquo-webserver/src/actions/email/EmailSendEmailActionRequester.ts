import { createErrorEnumForAction } from 'quidproquo-core';

import { EmailActionType } from './EmailActionType';
import { EmailSendEmailActionPayload, EmailSendEmailActionRequester } from './EmailSendEmailActionTypes';

export const EmailSendEmailErrorTypeEnum = createErrorEnumForAction(EmailActionType.SendEmail, [
  'MessageRejected',
  'SenderNotVerified',
  'AccountSuspended',
  'SendingPaused',
  'Throttled',
  'LimitExceeded',
  'BadRequest',
]);

export function* askEmailSendEmail(payload: EmailSendEmailActionPayload): EmailSendEmailActionRequester {
  return yield {
    type: EmailActionType.SendEmail,
    payload,
  };
}
