import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  AiActionType,
  AiPromptStreamActionProcessor,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { stepCountIs, streamText } from 'ai';

import { randomGuid } from '../../../awsLambdaUtils';
import { mapAiStreamPart, prepareAiPromptCall, toSdkMessages } from './logic';

const getProcessAiPromptStream = (qpqConfig: QPQConfig): AiPromptStreamActionProcessor => {
  return async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const prepared = prepareAiPromptCall(qpqConfig, payload, session, actionProcessorList, logger, dynamicModuleLoader, streamRegistry);
    if ('error' in prepared) {
      return actionResultError(prepared.error.type, prepared.error.message);
    }

    const promptOrMessages = payload.messages
      ? { messages: toSdkMessages(payload.messages) }
      : { prompt: payload.prompt };

    try {
      const { fullStream } = streamText({
        model: prepared.model,
        system: payload.system,
        ...promptOrMessages,
        tools: prepared.tools,
        stopWhen: stepCountIs(10),
        // streamText swallows errors by default to keep the server alive — surface them to CloudWatch.
        onError: ({ error }) => {
          // todo yeild this out
          console.error('AI prompt stream error:', error);
        },
      });

      const streamId = `ai-prompt-${Date.now()}-${randomGuid()}`;

      async function* aiStreamIterator(): AsyncIterableIterator<string> {
        for await (const part of fullStream) {
          yield JSON.stringify(mapAiStreamPart(part));
        }
      }

      streamRegistry.register(streamId, aiStreamIterator());

      return actionResult({ id: streamId, encoding: 'json' as const });
    } catch (error) {
      if (error instanceof Error) {
        return actionResultError(ErrorTypeEnum.GenericError, error.message);
      }

      return actionResultError(ErrorTypeEnum.GenericError, 'An error occurred during AI prompt stream.');
    }
  };
};

export const getAiPromptStreamActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [AiActionType.PromptStream]: getProcessAiPromptStream(qpqConfig),
});
