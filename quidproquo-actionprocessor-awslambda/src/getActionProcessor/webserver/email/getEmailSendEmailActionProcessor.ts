import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
} from 'quidproquo-core';
import { EmailActionType, EmailSendEmailActionProcessor, EmailSendEmailErrorTypeEnum } from 'quidproquo-webserver';

import { sendEmail } from '../../../logic/sesV2/sendEmail';

const getProcessSendEmail = (qpqConfig: QPQConfig): EmailSendEmailActionProcessor => {
  return async (payload) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const messageId = await sendEmail(payload, region);

      return actionResult(messageId);
    } catch (error) {
      return actionResultErrorFromCaughtError(error, {
        MessageRejected: () => actionResultError(EmailSendEmailErrorTypeEnum.MessageRejected, 'Message rejected'),
        MailFromDomainNotVerifiedException: () => actionResultError(EmailSendEmailErrorTypeEnum.SenderNotVerified, 'Sender domain not verified'),
        AccountSuspendedException: () => actionResultError(EmailSendEmailErrorTypeEnum.AccountSuspended, 'Email sending account suspended'),
        SendingPausedException: () => actionResultError(EmailSendEmailErrorTypeEnum.SendingPaused, 'Email sending is paused'),
        TooManyRequestsException: () => actionResultError(EmailSendEmailErrorTypeEnum.Throttled, 'Rate exceeded'),
        LimitExceededException: () => actionResultError(EmailSendEmailErrorTypeEnum.LimitExceeded, 'Sending limit exceeded'),
        BadRequestException: () => actionResultError(EmailSendEmailErrorTypeEnum.BadRequest, 'Invalid email request'),
      });
    }
  };
};

export const getEmailSendEmailActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EmailActionType.SendEmail]: getProcessSendEmail(qpqConfig),
});
