import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { EmailActionType } from './EmailActionType';
import { askEmailSendEmail, EmailSendEmailErrorTypeEnum } from './EmailSendEmailActionRequester';

describe('askEmailSendEmail', () => {
  it('yields a SendEmail action with the payload verbatim, including attachments', () => {
    const payload = {
      from: 'noreply@example.com',
      to: ['someone@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      replyTo: ['support@example.com'],
      subject: 'Hello',
      bodyText: 'plain text',
      bodyHtml: '<p>plain text</p>',
      attachments: [{ base64Data: 'aGVsbG8=', filename: 'hello.txt', mimetype: 'text/plain' }],
    };

    const { action } = captureRequester(askEmailSendEmail(payload));

    expect(action).toEqual({
      type: EmailActionType.SendEmail,
      payload,
    });
  });
});

describe('EmailSendEmailErrorTypeEnum', () => {
  it('namespaces each error name under the SendEmail action type', () => {
    expect(EmailSendEmailErrorTypeEnum.MessageRejected).toBe(`${EmailActionType.SendEmail}-MessageRejected`);
    expect(EmailSendEmailErrorTypeEnum.SenderNotVerified).toBe(`${EmailActionType.SendEmail}-SenderNotVerified`);
    expect(EmailSendEmailErrorTypeEnum.AccountSuspended).toBe(`${EmailActionType.SendEmail}-AccountSuspended`);
    expect(EmailSendEmailErrorTypeEnum.SendingPaused).toBe(`${EmailActionType.SendEmail}-SendingPaused`);
    expect(EmailSendEmailErrorTypeEnum.Throttled).toBe(`${EmailActionType.SendEmail}-Throttled`);
    expect(EmailSendEmailErrorTypeEnum.LimitExceeded).toBe(`${EmailActionType.SendEmail}-LimitExceeded`);
    expect(EmailSendEmailErrorTypeEnum.BadRequest).toBe(`${EmailActionType.SendEmail}-BadRequest`);
  });
});
