import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';
import { getCoreActionProcessor as getAwsCoreActionProcessor } from './core';
import { getWebserverActionProcessor as getAwsWebserverActionProcessor } from './webserver';

import {
  getCoreActionProcessor as getNodeCoreActionProcessor,
  getWebserverActionProcessor as getNodeWebserverActionProcessor,
} from 'quidproquo-actionprocessor-node';

export const getAwsActionProcessors: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => {
  const storyActionProcessor = {
    ...(await getNodeCoreActionProcessor(qpqConfig)),
    ...(await getNodeWebserverActionProcessor(qpqConfig)),

    ...(await getAwsCoreActionProcessor(qpqConfig)),
    ...(await getAwsWebserverActionProcessor(qpqConfig)),
  };

  return storyActionProcessor;
};

export * from './core';
export * from './webserver';
