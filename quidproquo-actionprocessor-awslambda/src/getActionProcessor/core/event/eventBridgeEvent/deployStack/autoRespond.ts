import { EventActionType, QPQConfig, EventAutoRespondActionProcessor, actionResult, DeployEventType, DeployEventStatusType } from 'quidproquo-core';

import { InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  return async ({ qpqEventRecord, matchResult }) => {
    // exit if we don't know what deploy type this is, probably another stack
    const earlyExit =
      qpqEventRecord.deployEventType === DeployEventType.Unknown || qpqEventRecord.deployEventStatusType === DeployEventStatusType.Unknown;

    // THIS IS A HACK... We need to support early exit on void responses...
    // Maybe void reponses should just be "completed successfully"... then we can early exit as it has completed successfully
    return actionResult(earlyExit as unknown as null);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
  };
};
