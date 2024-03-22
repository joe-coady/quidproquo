import { getCustomResourceCloudflareDnsEventActionProcessor } from 'quidproquo-actionprocessor-awslambda';

import { createRuntime, askProcessEvent, QpqRuntimeType } from 'quidproquo-core';

import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';

import { getLambdaConfigs } from './lambdaConfig';

import {
  getLogger,
  getRuntimeCorrelation,
  getLambdaActionProcessors,
  qpqFunctionMiddleware,
} from './lambda-utils';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const customResourceCloudflareDnsHandler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context,
) => {
  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),
    ...getCustomResourceCloudflareDnsEventActionProcessor(cdkConfig.qpqConfig),

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
    getLogger(cdkConfig.qpqConfig),
    getRuntimeCorrelation(cdkConfig.qpqConfig),
    QpqRuntimeType.CLOUD_FLARE_DEPLOY,
  );

  const result = await resolveStory(askProcessEvent, [event, context]);

  // throw an error if we have one
  if (result.error) {
    throw new Error(result.error.errorText);
  }
};

// Default executor
export const executeCustomResourceCloudflareDns = qpqFunctionMiddleware(
  customResourceCloudflareDnsHandler,
);
