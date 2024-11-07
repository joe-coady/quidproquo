import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  DynamicModuleLoader,
  QPQConfig,
  StoryResult,
} from 'quidproquo-core';
import { ServiceFunctionActionType, ServiceFunctionExecuteActionProcessor } from 'quidproquo-webserver';

import { eventBus } from '../../../logic/eventBus';
import { AnyExecuteServiceFunctionEventWithSession } from '../../core/event/node/serviceFunction/types';

const getProcessExecute = (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader): ServiceFunctionExecuteActionProcessor<any, any> => {
  return async ({ functionName, service, payload, context, isAsync }, session) => {
    const serviceFunctionEvent: AnyExecuteServiceFunctionEventWithSession = {
      functionName: functionName,
      serviceName: service,
      payload: payload,
      storySession: {
        ...session,
        context,
      },
    };

    const eventPromise: Promise<StoryResult<[AnyExecuteServiceFunctionEventWithSession], any>> = eventBus.publishAndWaitForResponse(
      ServiceFunctionActionType.Execute,
      serviceFunctionEvent,
    );

    if (isAsync) {
      return actionResult(void 0);
    }

    const response = await eventPromise;

    if (response.error) {
      return actionResultError(response.error.errorType, response.error.errorText, response.error.errorStack);
    }

    console.log('Result', response.result);

    return actionResult(response.result);
  };
};

export const getServiceFunctionExecuteActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  [ServiceFunctionActionType.Execute]: getProcessExecute(qpqConfig, dynamicModuleLoader),
});
