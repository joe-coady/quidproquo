import { Context } from 'aws-lambda';

import { QpqFunctionExecutionEvent } from '../../types';

import { SNSEvent } from 'aws-lambda';
import { dynamicModuleLoaderWarmer } from '../dynamicModuleLoader';

export const qpqFunctionMiddleware = <E extends QpqFunctionExecutionEvent<any>>(
  lambdaFunc: (event: E, context: Context) => any,
) => {
  return async (event: E, context: Context) => {
    console.log('tick: ', JSON.stringify(event, null, 2));

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

        // If we have events that are not warmers, then we should execute them
        if (recordsNoWarm.length > 0) {
          console.log('Running other actions');
          return lambdaFunc(
            {
              ...event,
              Records: recordsNoWarm,
            },
            context,
          );
        }

        return 'Warmed up!';
      }
    }

    console.log('Running normal event');
    return lambdaFunc(event, context);
  };
};
