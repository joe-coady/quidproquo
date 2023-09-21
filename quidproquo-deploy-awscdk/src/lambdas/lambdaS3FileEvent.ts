import { getS3FileEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, ErrorTypeEnum, QpqRuntimeType, StoryResult } from 'quidproquo-core';

import { S3Event, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';

import { getRuntimeCorrelation, getLambdaActionProcessors } from './lambda-utils';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export interface EmailPayload {
  username: string;
  code: string;

  userAttributes: Record<string, string>;
  baseDomain: string;
}

export const getS3FileEventExecutor = () => {
  return async (
    event: S3Event,
    context: Context
    ) => {
    const cdkConfig = await getLambdaConfigs();

    // Build a processor for the session and stuff
    // Remove the non route ones ~ let the story execute action add them
    const storyActionProcessor = {
      ...getLambdaActionProcessors(cdkConfig.qpqConfig),
      ...getS3FileEventActionProcessor(cdkConfig.qpqConfig),

      ...qpqCustomActionProcessors(),
    };

    const resolveStory = createRuntime(
      cdkConfig.qpqConfig,
      {
        depth: 0,
        context: {},
      },
      storyActionProcessor,
      getDateNow,
      async (result: StoryResult<any>) => {},
      getRuntimeCorrelation(cdkConfig.qpqConfig),
      QpqRuntimeType.STORAGEDRIVE_EVENT,
    );
    
    const storyResult = await resolveStory(askProcessEvent, [event, context]);

    return storyResult.result || {
      statusCode: 200,
    }
  };
};

// Default executor
export const executeS3FileEvent = getS3FileEventExecutor();
