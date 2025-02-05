import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  askLogCreate,
  AskResponse,
  EventActionType,
  EventTransformResponseResultActionPayload,
  EventTransformResponseResultActionProcessor,
  getProcessCustomImplementation,
  LogLevelEnum,
  QPQConfig,
} from 'quidproquo-core';

import { randomGuid } from '../../../../../awsLambdaUtils';
import { EventInput, EventOutput, InternalEventOutput, InternalEventRecord } from './types';

export function* askTransformResponseStory({
  eventParams,
  qpqEventRecordResponses: [record],
}: EventTransformResponseResultActionPayload<EventInput, InternalEventRecord>): AskResponse<EventOutput> {
  if (!record.success) {
    yield* askLogCreate(LogLevelEnum.Fatal, record.error.errorText, record.error.errorStack);
  }

  return {
    statusCode: 500,
  };
}

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // Create a custom runtime for errored responses so we can log them out
  const errorCustomImplementation = getProcessCustomImplementation<
    EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput>
  >(qpqConfig, askTransformResponseStory, 'Transform Errored Websocket Response', null, () => new Date().toISOString(), randomGuid);

  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader) => {
    if (payload.qpqEventRecordResponses.some((r) => !r.success)) {
      // We only wan't to run this for errors, because a custom imp is slower then a regular imp
      return await errorCustomImplementation(payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader);
    }

    return actionResult<EventOutput>({
      statusCode: 200,
    });
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
