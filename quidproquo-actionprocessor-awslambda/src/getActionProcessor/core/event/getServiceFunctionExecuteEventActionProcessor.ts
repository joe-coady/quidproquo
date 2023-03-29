import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import {
  HttpEventHeaders,
  qpqWebServerUtils,
  ExecuteServiceFunctionEvent,
} from 'quidproquo-webserver';

import { Context } from 'aws-lambda';

// TODO: Come clean this crap up.
export type ServiceFunctionMatchStoryResult = MatchStoryResult<unknown, unknown>;
export type ServiceFunctionExecuteEventParams = [ExecuteServiceFunctionEvent<any>, Context];
export type TransformedServiceFunctionExecuteEventParams = ExecuteServiceFunctionEvent<any>;
export type ServiceFunctionExecuteEventResponse = any;

const transformHttpEventHeadersToAPIGatewayProxyResultHeaders = (
  headers: HttpEventHeaders,
): {
  [header: string]: boolean | number | string;
} => {
  return Object.keys(headers)
    .filter((header) => !!headers[header])
    .reduce((acc, header) => ({ ...acc, [header]: headers[header] }), {});
};

const getProcessTransformEventParams = (
  qpqConfig: QPQConfig,
): EventTransformEventParamsActionProcessor<
  ServiceFunctionExecuteEventParams,
  TransformedServiceFunctionExecuteEventParams
> => {
  return async ({ eventParams: [executeServiceFunctionEvent, context] }) => {
    return actionResult(executeServiceFunctionEvent);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  ServiceFunctionExecuteEventResponse,
  TransformedServiceFunctionExecuteEventParams,
  ServiceFunctionExecuteEventResponse
> => {
  return async (payload) => {
    return actionResult<any>(payload.response);
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<
  ServiceFunctionExecuteEventResponse,
  ServiceFunctionMatchStoryResult,
  ServiceFunctionExecuteEventResponse | null
> => {
  return async (payload) => {
    return actionResult(null);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<
  TransformedServiceFunctionExecuteEventParams,
  ServiceFunctionMatchStoryResult
> => {
  const serviceFunctions = qpqWebServerUtils.getAllServiceFunctions(qpqConfig);

  return async ({ transformedEventParams }) => {
    // Find the most relevant match
    const matchedRoute = serviceFunctions.find(
      (sf) => sf.functionName === transformedEventParams.functionName,
    );

    if (!matchedRoute) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `service function not found [${transformedEventParams.functionName}]`,
      );
    }

    return actionResult<ServiceFunctionMatchStoryResult>({
      src: matchedRoute.src,
      runtime: matchedRoute.runtime,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(qpqConfig),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
