import { getQpqConfig } from './lambda-utils';
import { getCustomMessageTriggerEvent_defineAuthChallenge } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const customMessageTriggerEvent_defineAuthChallenge = getCustomMessageTriggerEvent_defineAuthChallenge(dynamicModuleLoader, getQpqConfig());
