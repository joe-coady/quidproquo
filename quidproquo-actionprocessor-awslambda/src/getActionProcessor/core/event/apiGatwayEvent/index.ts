import { QPQConfig } from 'quidproquo-core';

import getAutoRespond from './autoRespond';
import getGetRecords from './getRecords';
import getMatchStory from './matchStory';
import getTransformResponseResult from './transformResponseResult';

export default (qpqConfig: QPQConfig) => ({
  ...getGetRecords(qpqConfig),
  ...getMatchStory(qpqConfig),
  ...getAutoRespond(qpqConfig),
  ...getTransformResponseResult(qpqConfig),
});
