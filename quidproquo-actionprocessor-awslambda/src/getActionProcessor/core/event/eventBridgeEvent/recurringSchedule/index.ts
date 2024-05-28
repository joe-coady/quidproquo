import { QPQConfig } from 'quidproquo-core';

import getAutoRespond from './autoRespond';
import getGetRecords from './getRecords';
import getMatchStory from './matchStory';
import getTransformResponseResult from './transformResponseResult';

export const getEventBridgeEventActionProcessor = (qpqConfig: QPQConfig) => ({
  ...getGetRecords(qpqConfig),
  ...getMatchStory(qpqConfig),
  ...getAutoRespond(qpqConfig),
  ...getTransformResponseResult(qpqConfig),
});
