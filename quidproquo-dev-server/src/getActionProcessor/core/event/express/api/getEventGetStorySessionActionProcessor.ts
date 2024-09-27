/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  DynamicModuleLoader,
  EventActionType,
  EventGetStorySessionActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetStorySession =
  (
    qpqConfig: QPQConfig
  ): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord> =>
  async ({ qpqEventRecord, eventParams }) =>
    actionResult(void 0);

export const getEventGetStorySessionActionProcessor: ActionProcessorListResolver =
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
  });
