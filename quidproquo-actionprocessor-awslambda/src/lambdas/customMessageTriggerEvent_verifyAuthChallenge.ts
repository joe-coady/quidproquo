import { getQpqConfig } from './lambda-utils';
import { getCustomMessageTriggerEvent_verifyAuthChallenge } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const customMessageTriggerEvent_verifyAuthChallenge = getCustomMessageTriggerEvent_verifyAuthChallenge(dynamicModuleLoader, getQpqConfig());
