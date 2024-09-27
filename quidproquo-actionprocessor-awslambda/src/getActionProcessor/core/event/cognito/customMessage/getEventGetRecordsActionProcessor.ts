import {
  EventActionType,
  QPQConfig,
  actionResult,
  qpqCoreUtils,
  EventGetRecordsActionProcessor,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { EmailSendEventType } from 'quidproquo-webserver';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [customMessageTriggerEvent, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      eventType: EmailSendEventType.VerifyEmail,

      code: customMessageTriggerEvent.request.codeParameter,
      link: customMessageTriggerEvent.request.linkParameter,
      attributes: customMessageTriggerEvent.request.userAttributes,
      username: customMessageTriggerEvent.request.usernameParameter,
    };

    switch (customMessageTriggerEvent.triggerSource) {
      case 'CustomMessage_ForgotPassword': {
        if (customMessageTriggerEvent.request.clientMetadata?.['userInitiated'] === 'true') {
          internalEventRecord.eventType = EmailSendEventType.ResetPassword;
        } else {
          internalEventRecord.eventType = EmailSendEventType.ResetPasswordAdmin;
        }
        break;
      }

      case 'CustomMessage_VerifyUserAttribute':
        internalEventRecord.eventType = EmailSendEventType.VerifyEmail;
        break;
    }

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
