import { getQpqConfig } from './lambda-utils';
import { getSqsEvent_queueEvent } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const sqsEvent_queueEvent = getSqsEvent_queueEvent(dynamicModuleLoader, getQpqConfig());
