import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  DynamicModuleLoader,
  EitherActionResult,
  ErrorTypeEnum,
  QPQConfig,
  StorySession,
} from 'quidproquo-core';
import { ExecuteServiceFunctionEvent, ServiceFunctionActionType, ServiceFunctionExecuteActionProcessor } from 'quidproquo-webserver';

import { processEvent } from '../../../implementations/apiRuntime';
import { getNodeServiceFunctionEventProcessor } from '../../core';

type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

const getProcessExecute = (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader): ServiceFunctionExecuteActionProcessor<any, any> => {
  return async ({ functionName, service, payload, context, isAsync }, session) => {
    const serviceFunctionEvent: AnyExecuteServiceFunctionEventWithSession = {
      functionName: functionName,
      payload: payload,
      storySession: {
        ...session,
        context,
      },
    };

    const eventPromise = processEvent<AnyExecuteServiceFunctionEventWithSession, any>(
      serviceFunctionEvent,
      qpqConfig,
      dynamicModuleLoader,
      getNodeServiceFunctionEventProcessor,
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
