import { getApiGatewayEventHandler } from '../lambdaHandlers';

import { getQpqConfig } from './lambda-utils';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const apiGatewayEventHandler = getApiGatewayEventHandler(dynamicModuleLoader, getQpqConfig());
