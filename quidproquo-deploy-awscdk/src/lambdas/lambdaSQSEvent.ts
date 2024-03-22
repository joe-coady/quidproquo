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
import {
  getLogger,
  getRuntimeCorrelation,
  getLambdaActionProcessors,
  qpqFunctionMiddleware,
} from './lambda-utils';

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
    console.log('event: ', JSON.stringify(event, null, 2));

    const results = event.Records.map(async (record) => {
      console.log('record.body', record.body);

      const runtimeData = JSON.parse(record.body) as AnyQueueMessageWithSession;

      // Note to future joe, this is a bit of a hack,
      // basically queues can be trigged by alarms (and maybe other non code related things)
      // so there may not be a session, or a type / payload
      // we should move the processing of all this into the getSQSEventRecordActionProcessor
      // and we can then be assured that if the code errors, it will be caught and logged
      const resolveStory = await getStoryActionRuntime(
        dynamicModuleLoader,
        getCustomActionProcessors,
        runtimeData.storySession || {
          depth: 0,
          context: {},
        },
      );

      // TODO: Read above, this is a hack
      // if we need to support more non code related triggerers
      // then we need to move this code up into the getSQSEventRecordActionProcessor
      // and process it correctly, but that will mean we probably need to support multiple
      // story executions from the event processor, which is a larger change
      // we would need to worry about how depth flows down from the records into each story
      // and we would need to somehow return errors for the batchItemFailures
      const queueMessage: QueueMessage<any> = {
        type: runtimeData.type || 'AWS_ALARM',
        payload: runtimeData.payload || {},
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
// TODO: Why do we need dynamicModuleLoader?
export const executeSQSEvent = qpqFunctionMiddleware(getSQSEventExecutor(dynamicModuleLoader));
