import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getEventAutoRespondActionProcessor } from './getEventAutoRespondActionProcessor';
import { getEventGetRecordsActionProcessor } from './getEventGetRecordsActionProcessor';
import { getEventGetStorySessionActionProcessor } from './getEventGetStorySessionActionProcessor';
import { getEventMatchStoryActionProcessor } from './getEventMatchStoryActionProcessor';
import { getEventTransformResponseResultActionProcessor } from './getEventTransformResponseResultActionProcessor';

export const getSqsQueueEventProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getEventAutoRespondActionProcessor(qpqConfig)),
  ...(await getEventGetRecordsActionProcessor(qpqConfig)),
  ...(await getEventGetStorySessionActionProcessor(qpqConfig)),
  ...(await getEventMatchStoryActionProcessor(qpqConfig)),
  ...(await getEventTransformResponseResultActionProcessor(qpqConfig)),
});
