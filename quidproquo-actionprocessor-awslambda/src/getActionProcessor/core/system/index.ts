import getExecuteStoryActionProcessor from './getExecuteStoryActionProcessor';
import { DynamicModuleLoader } from '../../../types/DynamicLoader';

export default (dynamicModuleLoader: DynamicModuleLoader) => ({
  ...getExecuteStoryActionProcessor(dynamicModuleLoader),
});
