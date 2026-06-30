import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ClaudeAiActionType,
  ClaudeAiMessagesApiActionProcessor,
  ClaudeAiMessagesApiErrorTypeEnum,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import Anthropic, {
  APIConnectionError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from '@anthropic-ai/sdk';

const getProcessMessagesApi = (qpqConfig: QPQConfig): ClaudeAiMessagesApiActionProcessor => {
  return async ({ body, apiKey }) => {
    const anthropic = new Anthropic({ apiKey });

    try {
      const msg = await anthropic.messages.create(body);
      return actionResult(msg);
    } catch (error) {
      // The Anthropic SDK errors are instanceof-checkable classes (with a numeric
      // `status`), not name/code-keyed, so we map them directly rather than via
      // actionResultErrorFromCaughtError.
      if (error instanceof AuthenticationError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.Unauthorized, 'Invalid API key.');
      } else if (error instanceof PermissionDeniedError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.PermissionDenied, 'The API key lacks permission for this request.');
      } else if (error instanceof BadRequestError || error instanceof UnprocessableEntityError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.InvalidRequest, 'The request was rejected as invalid.');
      } else if (error instanceof RateLimitError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.RateLimited, 'Rate limited, please try again later.');
      } else if (error instanceof InternalServerError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.ServerError, 'The Anthropic API returned a server error.');
      } else if (error instanceof APIConnectionError) {
        return actionResultError(ClaudeAiMessagesApiErrorTypeEnum.ConnectionError, 'Could not reach the Anthropic API.');
      }

      console.log(error);
      return actionResultError(ErrorTypeEnum.GenericError, error instanceof Error ? error.message : 'An error occurred while processing your request.');
    }
  };
};

export const getClaudeAiMessagesApiActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ClaudeAiActionType.MessagesApi]: getProcessMessagesApi(qpqConfig),
});
