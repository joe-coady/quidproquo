import { SQSEvent, SQSBatchResponse, Context } from 'aws-lambda';

import {
  getSQSEventRecordActionProcessor,
  DynamicModuleLoader,
} from 'quidproquo-actionprocessor-awslambda';

import { getLambdaConfigs } from './lambdaConfig';

import {
  createRuntime,
  askProcessEvent,
  QpqRuntimeType,
  StorySession,
  QueueMessage,
} from 'quidproquo-core';

import { ActionProcessorListResolver } from './actionProcessorListResolver';
import { getLogger, getRuntimeCorrelation, getLambdaActionProcessors } from './lambda-utils';

import { dynamicModuleLoader } from './dynamicModuleLoader';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;
};

export const getStoryActionRuntime = async (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
  callerStorySession: StorySession,
) => {
  const cdkConfig = await getLambdaConfigs();

  // Build a processor for the session and stuff
  // Remove the non route ones ~ let the story execute action add them
  const storyActionProcessor = {
    ...getLambdaActionProcessors(cdkConfig.qpqConfig),

    ...getSQSEventRecordActionProcessor(cdkConfig.qpqConfig),

    ...qpqCustomActionProcessors(),
  };

  const resolveStory = createRuntime(
    cdkConfig.qpqConfig,
    callerStorySession,
    storyActionProcessor,
    getDateNow,
    getLogger(cdkConfig.qpqConfig),
    getRuntimeCorrelation(cdkConfig.qpqConfig),
    QpqRuntimeType.QUEUE_EVENT,
  );

  return resolveStory;
};

// TODO: We could make this entire function a story, that spawns an execute story for each record
export const getSQSEventExecutor = (
  dynamicModuleLoader: DynamicModuleLoader,
  getCustomActionProcessors: ActionProcessorListResolver = () => ({}),
) => {
  return async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
    // const queueQPQConfigSetting = getQueueConfigSetting();
    // TODO: Check settings / concurrency and such to make sure we can processes
    // in parallel
    console.log('num batch: ', event.Records.length);

    const results = event.Records.map(async (record) => {
      const runtimeData = JSON.parse(record.body) as AnyQueueMessageWithSession;

      const resolveStory = await getStoryActionRuntime(
        dynamicModuleLoader,
        getCustomActionProcessors,
        runtimeData.storySession,
      );

      const queueMessage: QueueMessage<any> = {
        type: runtimeData.type,
        payload: runtimeData.payload,
      };

      return {
        id: record.messageId,
        result: await resolveStory(askProcessEvent, [queueMessage, context]),
      };
    });

    const allResults = await Promise.all(results);

    const batchItemFailures = allResults
      .filter((r) => !!r.result.error)
      .map((r) => ({
        itemIdentifier: r.id,
      }));

    return {
      batchItemFailures,
    };
  };
};

// Default executor
export const executeSQSEvent = getSQSEventExecutor(dynamicModuleLoader);
