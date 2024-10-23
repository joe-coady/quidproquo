import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ClaudeAiActionType,
  ClaudeAiMessagesApiActionProcessor,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';
import Anthropic, { AuthenticationError } from '@anthropic-ai/sdk';

const getProcessMessagesApi = (qpqConfig: QPQConfig): ClaudeAiMessagesApiActionProcessor => {
  return async ({ body, apiKey }) => {
    const anthropic = new Anthropic({ apiKey });

    try {
      const msg = await anthropic.messages.create(body);
      return actionResult(msg);
    } catch (error) {
      console.log(error);

      if (error instanceof AuthenticationError) {
        return actionResultError(ErrorTypeEnum.Unauthorized, 'Invalid API key.');
      } else if (error instanceof Error) {
        return actionResultError(ErrorTypeEnum.GenericError, error.message);
      } else {
        return actionResultError(ErrorTypeEnum.GenericError, 'An error occurred while processing your request.');
      }
    }
  };
};

export const getClaudeAiMessagesApiActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ClaudeAiActionType.MessagesApi]: getProcessMessagesApi(qpqConfig),
});
