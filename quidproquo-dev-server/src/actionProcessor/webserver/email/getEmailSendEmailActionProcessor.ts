import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { EmailActionType, EmailSendEmailActionProcessor } from 'quidproquo-webserver';

// Local dev sends nothing: log what would have gone out and hand back a fake message id
const getProcessSendEmail = (): EmailSendEmailActionProcessor => {
  return async (payload) => {
    console.log('[email] send skipped (dev server)', {
      from: payload.from,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      replyTo: payload.replyTo,
      subject: payload.subject,
      bodyText: payload.bodyText?.slice(0, 200),
      bodyHtml: payload.bodyHtml?.slice(0, 200),
      attachments: payload.attachments?.map((attachment) => attachment.filename),
    });

    return actionResult(`dev-server-email-${payload.subject}`);
  };
};

export const getEmailSendEmailActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EmailActionType.SendEmail]: getProcessSendEmail(),
});
