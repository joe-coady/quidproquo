import { dynamicModuleLoader } from './dynamicModuleLoader';
import { getEventBridgeEvent_stackDeploy } from '../lambdaHandlers';
import { getQpqConfig } from './lambda-utils';

export const eventBridgeEvent_stackDeploy = getEventBridgeEvent_stackDeploy(dynamicModuleLoader, getQpqConfig());
