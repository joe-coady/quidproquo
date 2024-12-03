import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { EmailSendEventType } from 'quidproquo-webserver';

import { EventInput, InternalEventRecord, MatchResult } from './types';

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult, EventInput> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find((ud) => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async ({ qpqEventRecord }) => {
    switch (qpqEventRecord.eventType) {
      case EmailSendEventType.ResetPassword:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig?.emailTemplates.resetPassword,
        });
      case EmailSendEventType.ResetPasswordAdmin:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig?.emailTemplates.resetPasswordAdmin,
        });
      case EmailSendEventType.VerifyEmail:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig?.emailTemplates.verifyEmail,
        });
      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Email lambda not implemented for ${qpqEventRecord.eventType}`);
    }
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
