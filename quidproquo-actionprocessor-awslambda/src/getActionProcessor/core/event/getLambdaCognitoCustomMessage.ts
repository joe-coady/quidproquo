import {
  EventActionType,
  QPQConfig,
  qpqCoreUtils,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import {
  EmailSendEvent, EmailSendEventResponse, EmailSendEventType,
} from 'quidproquo-webserver';

import { CustomMessageTriggerEvent, Context } from 'aws-lambda';

type EventInput = [CustomMessageTriggerEvent, Context];
type EventOutput = EmailSendEventResponse;

// Internals
type InternalEventInput = EmailSendEvent;
type InternalEventOutput = EmailSendEventResponse;

type AutoRespondResult = boolean;
type MatchResult = MatchStoryResult<any, any>;

// TODO: Don't use Globals like this
const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

const getProcessTransformEventParams = (
  serviceName: string,
): EventTransformEventParamsActionProcessor<EventInput, InternalEventInput> => {

  return async ({ eventParams: [customMessageTriggerEvent, context] }) => {

    const transformedEventParams: InternalEventInput = {
      eventType: EmailSendEventType.VerifyEmail,

      code: customMessageTriggerEvent.request.codeParameter,
      link: customMessageTriggerEvent.request.linkParameter,
      attributes: customMessageTriggerEvent.request.userAttributes,
      username: customMessageTriggerEvent.request.usernameParameter,
    };

    switch (customMessageTriggerEvent.triggerSource) {
      case 'CustomMessage_ForgotPassword': {
        if (customMessageTriggerEvent.request.clientMetadata?.['userInitiated'] === 'true') {
          transformedEventParams.eventType = EmailSendEventType.ResetPassword;
        } else {
          transformedEventParams.eventType = EmailSendEventType.ResetPasswordAdmin;
        }
        break;
      }

      case 'CustomMessage_VerifyUserAttribute':
        transformedEventParams.eventType = EmailSendEventType.VerifyEmail;
        break;
    }

    return actionResult(transformedEventParams);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  InternalEventOutput,
  InternalEventInput,
  EventOutput
> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    return actionResult<EventOutput>({
      subject: payload.response.subject,
      body: payload.response.body,
    });
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<
  InternalEventInput,
  MatchResult,
  AutoRespondResult
> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find(ud => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async (payload) => {
    switch (payload.transformedEventParams.eventType) {
      case EmailSendEventType.ResetPassword:
        return actionResult(
          !userDirectoryConfig?.emailTemplates.resetPassword?.src &&
          !userDirectoryConfig?.emailTemplates.resetPassword?.runtime
        );
      case EmailSendEventType.ResetPasswordAdmin:
        return actionResult(
          !userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.src &&
          !userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.runtime
        );
      case EmailSendEventType.VerifyEmail:
        return actionResult(
          !userDirectoryConfig?.emailTemplates.verifyEmail?.src &&
          !userDirectoryConfig?.emailTemplates.verifyEmail?.runtime
        );
    }

    return actionResult(false);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  const userDirectoryConfig = qpqCoreUtils.getUserDirectories(qpqConfig).find(ud => ud.name === GLOBAL_USER_DIRECTORY_NAME);

  return async (payload) => {
    switch (payload.transformedEventParams.eventType) {
      case EmailSendEventType.ResetPassword:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.resetPassword?.src,
          runtime: userDirectoryConfig?.emailTemplates.resetPassword?.runtime
        });
      case EmailSendEventType.ResetPasswordAdmin:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.src,
          runtime: userDirectoryConfig?.emailTemplates.resetPasswordAdmin?.runtime
        });
      case EmailSendEventType.VerifyEmail:
        return actionResult<MatchResult>({
          src: userDirectoryConfig?.emailTemplates.verifyEmail?.src,
          runtime: userDirectoryConfig?.emailTemplates.verifyEmail?.runtime
        });
      default:
        return actionResultError(
          ErrorTypeEnum.NotFound,
          `Email lambda not implemented for ${payload.transformedEventParams.eventType}`,
        );
    }
  };
};

export default (qpqConfig: QPQConfig) => {
  // TODO: Make this aware of the API that we are eventing
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(serviceName),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
