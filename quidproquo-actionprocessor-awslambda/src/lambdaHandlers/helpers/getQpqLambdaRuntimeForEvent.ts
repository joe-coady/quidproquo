import { getCustomActionActionProcessor } from 'quidproquo-actionprocessor-node';
import {
  ActionProcessorListResolver,
  askProcessEvent,
  createRuntime,
  DynamicModuleLoader,
  QPQConfig,
  QpqRuntimeType,
  StorySession,
} from 'quidproquo-core';

import { Context } from 'aws-lambda';
import { SNSEvent } from 'aws-lambda';

import { getAwsActionProcessors } from '../../getActionProcessor';
import { QpqFunctionExecutionEvent } from '../types';
import { dynamicModuleLoaderWarmer } from './dynamicModuleLoaderWarmer';
import { getRuntimeCorrelation } from './getRuntimeCorrelation';
import { getLogger } from './logger';

const isSnsEvent = <T>(event: QpqFunctionExecutionEvent<T>): event is SNSEvent => {
  if (event && typeof event === 'object') {
    const possibleSnsEvent = event as unknown as SNSEvent;
    return possibleSnsEvent.Records && Array.isArray(possibleSnsEvent.Records);
  }

  return false;
};

export const getQpqLambdaRuntimeForEvent = <E extends QpqFunctionExecutionEvent<any>>(
  runtimeType: QpqRuntimeType,
  getStorySession: (event: E) => StorySession,
  getActionProcessorList: ActionProcessorListResolver,
  dynamicModuleLoader: DynamicModuleLoader,
  qpqConfig: QPQConfig,
) => {
  return async (event: E, context: Context) => {
    console.log('tick: ', JSON.stringify(event, null, 2));

    const logger = getLogger(qpqConfig);

    const resolveStory = createRuntime(
      qpqConfig,
      getStorySession(event),
      async () => ({
        ...(await getAwsActionProcessors(qpqConfig, dynamicModuleLoader)),
        ...(await getActionProcessorList(qpqConfig, dynamicModuleLoader)),

        // Always done last, so they can ovveride the default ones if the user wants.
        ...(await getCustomActionActionProcessor(qpqConfig, dynamicModuleLoader)),
      }),
      () => new Date().toISOString(),
      logger,
      getRuntimeCorrelation(qpqConfig),
      runtimeType,
      dynamicModuleLoader,
    );

    const processEvent = async () => {
      const result = await resolveStory(askProcessEvent, [event, context]);
      await logger.waitToFinishWriting();

      if (result.error) {
        throw new Error(result.error.errorText);
      }

      console.log('Finished, returning: ', result.result);
      return result.result;
    };

    if (isSnsEvent(event)) {
      // Non warmer records
      const recordsNoWarm = event.Records.filter(
        (record) => record.EventSource !== 'aws:sns' || JSON.parse(record.Sns.Message).type !== 'QpqLambdaWarmerEvent',
      );

      // if we have found some warmers - then we need to warm the lambda
      if (recordsNoWarm.length !== event.Records.length) {
        console.log('Found SNS warmer');

        // TODO: Warm qpq things with dynamic functions
        // federate in dynamic modules
        await dynamicModuleLoaderWarmer();

        // Might as well move the logs to permanent storage
        await logger.moveToPermanentStorage();

        return 'Warmed up!';
      }

      // If we have events that are not warmers, then we should execute them
      if (recordsNoWarm.length > 0) {
        console.log('Running other actions');

        return await processEvent();
      }
    }

    return await processEvent();
  };
};
