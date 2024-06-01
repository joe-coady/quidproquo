import { QPQConfig } from 'quidproquo-core';

import getAutoRespond from './autoRespond';
import getGetRecords from './getRecords';
import getStorySession from './getStorySession';
import getMatchStory from './matchStory';
import getTransformResponseResult from './transformResponseResult';

export const getApiGatewayApiEventEventProcessor = (qpqConfig: QPQConfig) => ({
  ...getStorySession(qpqConfig),
  ...getGetRecords(qpqConfig),
  ...getMatchStory(qpqConfig),
  ...getAutoRespond(qpqConfig),
  ...getTransformResponseResult(qpqConfig),
});
