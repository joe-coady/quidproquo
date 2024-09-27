import { getQpqConfig } from './lambda-utils';
import { getCustomMessageTriggerEvent_customMessage } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const customMessageTriggerEvent_customMessage = getCustomMessageTriggerEvent_customMessage(dynamicModuleLoader, getQpqConfig());
