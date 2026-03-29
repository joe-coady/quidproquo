import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  AiActionType,
  AiPromptActionProcessor,
  askInlineFunctionExecute,
  createImplementationRuntime,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { generateText, jsonSchema, stepCountIs } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

import { randomGuid } from '../../../awsLambdaUtils';
import { bedrockModelMap } from './aiModelMap';

const getProcessAiPrompt = (qpqConfig: QPQConfig): AiPromptActionProcessor => {
  return async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
    const bedrock = createAmazonBedrock({ region });
    const bedrockModelId = bedrockModelMap[payload.model];

    if (!bedrockModelId) {
      return actionResultError(ErrorTypeEnum.NotImplemented, `Unsupported AI model: ${payload.model}`);
    }

    // Build tools from defineAi config if aiName is provided
    const aiTools: Record<string, any> = {};

    if (payload.aiName) {
      const aiConfigs = qpqCoreUtils.getAllAiConfigs(qpqConfig);
      const aiConfig = aiConfigs.find((c) => c.aiName === payload.aiName);

      if (!aiConfig) {
        return actionResultError(ErrorTypeEnum.NotFound, `AI config not found: ${payload.aiName}`);
      }

      for (const toolDef of aiConfig.tools) {
        aiTools[toolDef.name] = {
          description: toolDef.description,
          inputSchema: jsonSchema(toolDef.inputSchema),
          execute: async (args: unknown) => {
            const resolveStory = createImplementationRuntime(
              qpqConfig,
              [`AI Tool: ${toolDef.name}`],
              () => new Date().toISOString(),
              randomGuid,
              session,
              actionProcessorList,
              logger,
              dynamicModuleLoader,
              streamRegistry,
            );

            const storyResult = await resolveStory(function* () {
              return yield* askInlineFunctionExecute(toolDef.executor, args);
            }, []);

            if (storyResult.error) {
              throw new Error(storyResult.error.errorText);
            }

            return storyResult.result;
          },
        };
      }
    }

    try {
      const result = await generateText({
        model: bedrock(bedrockModelId),
        system: payload.system,
        prompt: payload.prompt,
        tools: Object.keys(aiTools).length > 0 ? aiTools : undefined,
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
