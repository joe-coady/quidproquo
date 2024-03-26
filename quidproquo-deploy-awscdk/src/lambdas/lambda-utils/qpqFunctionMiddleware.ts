import { Context } from 'aws-lambda';

import { QpqFunctionExecutionEvent } from '../../types';

import { SNSEvent } from 'aws-lambda';
import { dynamicModuleLoaderWarmer } from '../dynamicModuleLoader';
import { getLambdaConfigs } from '../lambdaConfig';
import { getLogger } from './logger';
import { QpqLogger } from 'quidproquo-core';

export const qpqFunctionMiddleware = <E extends QpqFunctionExecutionEvent<any>>(
  lambdaFunc: (event: E, context: Context, logger: QpqLogger) => any,
) => {
  return async (event: E, context: Context) => {
    console.log('tick: ', JSON.stringify(event, null, 2));

    const cdkConfig = await getLambdaConfigs();
    const logger = getLogger(cdkConfig.qpqConfig);

    const snsEvent = event as SNSEvent;
    if (event && typeof event === 'object' && snsEvent.Records && Array.isArray(snsEvent.Records)) {
      console.log('Found possible SNS Event');
      const recordsNoWarm = snsEvent.Records.filter(
        (record) =>
          record.EventSource !== 'aws:sns' ||
          JSON.parse(record.Sns.Message).type !== 'QpqLambdaWarmerEvent',
      );

      // if we have found some warmers - then we need to warm the lambda
      if (recordsNoWarm.length !== snsEvent.Records.length) {
        console.log('Found SNS warmer');
        // TODO: Warm qpq things with dynamic functions
        await dynamicModuleLoaderWarmer();

        // Might as well move the logs to permanent storage
        await logger.moveToPermanentStorage();

        // If we have events that are not warmers, then we should execute them
        if (recordsNoWarm.length > 0) {
          console.log('Running other actions');
          const result = await lambdaFunc(
            {
              ...event,
              Records: recordsNoWarm,
            },
            context,
            logger,
          );

          await logger.waitToFinishWriting();
          return result;
        }

        return 'Warmed up!';
      }
    }

    console.log('Running normal event');
    const result = await lambdaFunc(event, context, logger);
    await logger.waitToFinishWriting();
    return result;
  };
};
