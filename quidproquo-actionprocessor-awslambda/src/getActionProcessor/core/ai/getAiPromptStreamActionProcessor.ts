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
import { createDriveFileResolver, mapAiStreamPart, prepareAiPromptCall, toCacheableMessages, toCacheableSystem, toSdkMessages } from './logic';

const getProcessAiPromptStream = (qpqConfig: QPQConfig): AiPromptStreamActionProcessor => {
  return async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const prepared = prepareAiPromptCall(qpqConfig, payload, session, actionProcessorList, logger, dynamicModuleLoader, streamRegistry);
    if ('error' in prepared) {
      return actionResultError(prepared.error.type, prepared.error.message);
    }

    try {
      const promptOrMessages = payload.messages
        ? {
            messages: toCacheableMessages(
              await toSdkMessages(
                payload.messages,
                createDriveFileResolver(qpqConfig, session, actionProcessorList, logger, dynamicModuleLoader, streamRegistry),
              ),
              payload.caching,
            ),
          }
        : { prompt: payload.prompt };

      // Extended thinking — thinking progress streams out as Reasoning* parts.
      const providerOptions = payload.reasoning
        ? { bedrock: { reasoningConfig: { type: 'enabled' as const, budgetTokens: payload.reasoning.budgetTokens ?? 4096 } } }
        : undefined;

      const { fullStream, finalStep } = streamText({
        model: prepared.model,
        system: toCacheableSystem(payload.system, payload.caching),
        ...promptOrMessages,
        tools: prepared.tools,
        providerOptions,
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

        if (payload.caching) {
          // The SDK's cross-provider usage breakdown, not providerMetadata.bedrock.usage — that
          // field never carries cacheReadInputTokens through on @ai-sdk/amazon-bedrock (5.0.11).
          const step = await finalStep;
          console.log('AI prompt cache usage:', step.usage?.inputTokenDetails);
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

export const getAiPromptStreamActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [AiActionType.PromptStream]: getProcessAiPromptStream(qpqConfig),
});
