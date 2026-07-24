import { Action, ActionProcessor, ActionRequester, QPQBinaryData } from 'quidproquo-core';

import { EmailActionType } from './EmailActionType';

// At least one of bodyText / bodyHtml must be provided
export type EmailSendEmailBody = { bodyText: string; bodyHtml?: string } | { bodyText?: string; bodyHtml: string };

// Payload
export type EmailSendEmailActionPayload = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  attachments?: QPQBinaryData[];
} & EmailSendEmailBody;

// Action
export interface EmailSendEmailAction extends Action<EmailSendEmailActionPayload> {
  type: EmailActionType.SendEmail;
  payload: EmailSendEmailActionPayload;
}

// Function Types
export type EmailSendEmailActionProcessor = ActionProcessor<EmailSendEmailAction, string>;
export type EmailSendEmailActionRequester = ActionRequester<EmailSendEmailAction, string>;
