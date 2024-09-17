import { getQpqConfig } from './lambda-utils';
import { getCloudFrontRequestEvent_originRequest } from '../lambdaHandlers';
import { dynamicModuleLoader } from './dynamicModuleLoader';

export const cloudFrontRequestEvent_originRequest = getCloudFrontRequestEvent_originRequest(dynamicModuleLoader, getQpqConfig());
