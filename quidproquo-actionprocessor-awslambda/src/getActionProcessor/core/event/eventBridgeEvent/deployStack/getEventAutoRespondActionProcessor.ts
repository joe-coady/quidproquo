import {
  EventActionType,
  QPQConfig,
  EventAutoRespondActionProcessor,
  actionResult,
  DeployEventType,
  DeployEventStatusType,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  return async ({ qpqEventRecord, matchResult }) => {
    // exit if we don't know what deploy type this is, probably another stack
    const earlyExit =
      qpqEventRecord.deployEventType === DeployEventType.Unknown || qpqEventRecord.deployEventStatusType === DeployEventStatusType.Unknown;

    // This is strange, but null means don't early exit.
    return actionResult(!earlyExit ? null : void 0);
  };
};

export const getEventAutoRespondActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
});
