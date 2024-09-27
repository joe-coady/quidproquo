import { getQpqConfig } from './lambda-utils';

import { dynamicModuleLoader } from './dynamicModuleLoader';
import { getAnyExecuteServiceFunctionEvent_serviceFunction } from '../lambdaHandlers';

export const anyExecuteServiceFunctionEvent_serviceFunction = getAnyExecuteServiceFunctionEvent_serviceFunction(dynamicModuleLoader, getQpqConfig());
