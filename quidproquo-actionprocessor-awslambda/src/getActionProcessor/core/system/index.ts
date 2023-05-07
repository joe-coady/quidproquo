import { QPQConfig } from 'quidproquo-core';

import getExecuteStoryActionProcessor from './getExecuteStoryActionProcessor';
import { DynamicModuleLoader } from '../../../types/DynamicLoader';

export default (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader) => ({
  ...getExecuteStoryActionProcessor(qpqConfig, dynamicModuleLoader),
});
