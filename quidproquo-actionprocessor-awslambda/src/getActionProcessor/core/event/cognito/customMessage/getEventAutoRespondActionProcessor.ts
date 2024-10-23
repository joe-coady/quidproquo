import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventAutoRespondActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { EmailSendEventType } from 'quidproquo-webserver';

import { GLOBAL_USER_DIRECTORY_NAME, InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord, matchResult }) => {
    const getErrorResult = () => actionResultError(ErrorTypeEnum.NotFound, `Email lambda not implemented for ${qpqEventRecord.eventType}`);

    switch (qpqEventRecord.eventType) {
      case EmailSendEventType.ResetPassword:
        if (!userDirectoryConfig?.emailTemplates.resetPassword) {
          return getErrorResult();
        }
        break;

      case EmailSendEventType.ResetPasswordAdmin:
        if (!userDirectoryConfig?.emailTemplates.resetPasswordAdmin) {
          return getErrorResult();
        }
        break;

      case EmailSendEventType.VerifyEmail:
        if (!userDirectoryConfig?.emailTemplates.verifyEmail) {
          return getErrorResult();
        }
        break;

      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Email processor not implemented for ${qpqEventRecord.eventType}`);
    }

    return actionResult(null);
  };
};

export const getEventAutoRespondActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
});
