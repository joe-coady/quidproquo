import {
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  actionResult,
  actionResultError,
  qpqCoreUtils,
} from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';
import { EmailSendEventType } from 'quidproquo-webserver';

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord }) => {
    switch (qpqEventRecord.eventType) {
      case EmailSendEventType.ResetPassword:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.resetPassword?.src,
          runtime: userDirectoryConfig?.emailTemplates.resetPassword?.runtime,
        });
      case EmailSendEventType.ResetPasswordAdmin:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.src,
          runtime: userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.runtime,
        });
      case EmailSendEventType.VerifyEmail:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.verifyEmail?.src,
          runtime: userDirectoryConfig?.emailTemplates.verifyEmail?.runtime,
        });
      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Email lambda not implemented for ${qpqEventRecord.eventType}`);
    }
  };
};
export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
