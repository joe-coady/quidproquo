import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  AiActionType,
  AiPromptActionProcessor,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { generateText, stepCountIs } from 'ai';

import { prepareAiPromptCall, toSdkMessages } from './logic';

const getProcessAiPrompt = (qpqConfig: QPQConfig): AiPromptActionProcessor => {
  return async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const prepared = prepareAiPromptCall(qpqConfig, payload, session, actionProcessorList, logger, dynamicModuleLoader, streamRegistry);
    if ('error' in prepared) {
      return actionResultError(prepared.error.type, prepared.error.message);
    }

    const promptOrMessages = payload.messages
      ? { messages: toSdkMessages(payload.messages) }
      : { prompt: payload.prompt };

    try {
      const result = await generateText({
        model: prepared.model,
        system: payload.system,
        ...promptOrMessages,
        tools: prepared.tools,
        stopWhen: stepCountIs(10),
      });

      return actionResult({ text: result.text });
    } catch (error) {
      if (error instanceof Error) {
        return actionResultError(ErrorTypeEnum.GenericError, error.message);
      }

      return actionResultError(ErrorTypeEnum.GenericError, 'An error occurred during AI prompt execution.');
    }
  };
};

export const getAiPromptActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [AiActionType.Prompt]: getProcessAiPrompt(qpqConfig),
});
