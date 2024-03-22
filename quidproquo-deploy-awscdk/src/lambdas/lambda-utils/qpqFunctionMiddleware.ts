import { Context } from 'aws-lambda';

import { QpqFunctionExecutionEvent } from '../../types';

export const qpqFunctionMiddleware = <E extends QpqFunctionExecutionEvent<any>>(
  lambdaFunc: (event: E, context: Context) => any,
) => {
  return async (event: E, context: Context) => {
    console.log('tick: ', event);

    if (typeof event === 'object' && (event as any).qpqWarm) {
      return 'Warmed up!';
    }

    return lambdaFunc(event, context);
  };
};
