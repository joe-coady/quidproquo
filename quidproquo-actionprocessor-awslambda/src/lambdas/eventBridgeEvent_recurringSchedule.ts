import { getEventBridgeEvent_recurringSchedule } from '../lambdaHandlers';

import { getQpqConfig } from './lambda-utils';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const eventBridgeEvent_recurringSchedule = getEventBridgeEvent_recurringSchedule(dynamicModuleLoader, getQpqConfig());
