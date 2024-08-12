import {
  EventActionType,
  QPQConfig,
  EventAutoRespondActionProcessor,
  actionResult,
  qpqCoreUtils,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import { GLOBAL_USER_DIRECTORY_NAME, InternalEventOutput, InternalEventRecord, MatchResult } from './types';
import { EmailSendEventType } from 'quidproquo-webserver';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord, matchResult }) => {
    const getErrorResult = () => actionResultError(ErrorTypeEnum.NotFound, `Email lambda not implemented for ${qpqEventRecord.eventType}`);

    switch (qpqEventRecord.eventType) {
      case EmailSendEventType.ResetPassword:
        if (!userDirectoryConfig?.emailTemplates.resetPassword?.src || !userDirectoryConfig?.emailTemplates.resetPassword?.runtime) {
          return getErrorResult();
        }
        break;

      case EmailSendEventType.ResetPasswordAdmin:
        if (!userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.src || !userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.runtime) {
          return getErrorResult();
        }
        break;

      case EmailSendEventType.VerifyEmail:
        if (!userDirectoryConfig?.emailTemplates.verifyEmail?.src || !userDirectoryConfig?.emailTemplates.verifyEmail?.runtime) {
          return getErrorResult();
        }
        break;

      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Email processor not implemented for ${qpqEventRecord.eventType}`);
    }

    return actionResult(null);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
  };
};
