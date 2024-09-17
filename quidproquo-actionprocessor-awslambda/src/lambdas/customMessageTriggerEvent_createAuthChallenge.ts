import { getQpqConfig } from './lambda-utils';
import { getCustomMessageTriggerEvent_createAuthChallenge } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const customMessageTriggerEvent_createAuthChallenge = getCustomMessageTriggerEvent_createAuthChallenge(dynamicModuleLoader, getQpqConfig());
