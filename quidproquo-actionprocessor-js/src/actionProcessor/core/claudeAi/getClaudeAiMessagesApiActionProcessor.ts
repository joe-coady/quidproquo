import {
  actionResult,
  actionResultError,
  askClaudeAiMessagesApi,
  ClaudeAiActionType,
  createActionProcessor,
  ErrorTypeEnum,
  ProcessorFor,
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

const getProcessMessagesApi = (qpqConfig: QPQConfig): ProcessorFor<typeof askClaudeAiMessagesApi> => {
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
        return actionResultError(askClaudeAiMessagesApi.errorType.Unauthorized, 'Invalid API key.');
      } else if (error instanceof PermissionDeniedError) {
        return actionResultError(askClaudeAiMessagesApi.errorType.PermissionDenied, 'The API key lacks permission for this request.');
      } else if (error instanceof BadRequestError || error instanceof UnprocessableEntityError) {
        return actionResultError(askClaudeAiMessagesApi.errorType.InvalidRequest, 'The request was rejected as invalid.');
      } else if (error instanceof RateLimitError) {
        return actionResultError(askClaudeAiMessagesApi.errorType.RateLimited, 'Rate limited, please try again later.');
      } else if (error instanceof InternalServerError) {
        return actionResultError(askClaudeAiMessagesApi.errorType.ServerError, 'The Anthropic API returned a server error.');
      } else if (error instanceof APIConnectionError) {
        return actionResultError(askClaudeAiMessagesApi.errorType.ConnectionError, 'Could not reach the Anthropic API.');
      }

      console.log(error);
      return actionResultError(
        ErrorTypeEnum.GenericError,
        error instanceof Error ? error.message : 'An error occurred while processing your request.',
      );
    }
  };
};

export const getClaudeAiMessagesApiActionProcessor = createActionProcessor(askClaudeAiMessagesApi, getProcessMessagesApi);
