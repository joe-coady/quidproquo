import { QPQConfig } from 'quidproquo-core';

import getAutoRespond from './autoRespond';
import getGetRecords from './getRecords';
import getMatchStory from './matchStory';
import getTransformResponseResult from './transformResponseResult';
import getStorySession from './getStorySession';

export const getcognitoCustomMessageEventProcessor = (qpqConfig: QPQConfig) => ({
  ...getStorySession(qpqConfig),
  ...getGetRecords(qpqConfig),
  ...getMatchStory(qpqConfig),
  ...getAutoRespond(qpqConfig),
  ...getTransformResponseResult(qpqConfig),
});
