import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventAutoRespondActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond =
  (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> =>
  async ({ qpqEventRecord, matchResult }) => {
    if (qpqEventRecord.method === 'OPTIONS') {
      return actionResult({
        status: 200,
        isBase64Encoded: false,
        body: '',
        headers: qpqWebServerUtils.getCorsHeaders(qpqConfig, matchResult.config || {}, qpqEventRecord.headers),
      });
    }

    return actionResult(null);
  };

export const getEventAutoRespondActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
});
