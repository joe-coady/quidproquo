import { getLogger } from 'quidproquo-actionprocessor-awslambda';
import {
  ActionProcessorListResolver,
  askProcessEvent,
  createRuntime,
  DynamicModuleLoader,
  QPQConfig,
  qpqCoreUtils,
  QpqRuntimeType,
  StoryResult,
} from 'quidproquo-core';

import { randomUUID } from 'crypto';

import { getDevServerActionProcessors, getExpressApiEventEventProcessor } from '../actionProcessor';

// TODO: Make this a util or something based on server time or something..
const getDateNow = () => new Date().toISOString();

export const processEvent = async <E, ER>(
  expressEvent: E,
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
  getActionProcessors: ActionProcessorListResolver,
  qpqRuntimeType: QpqRuntimeType,
): Promise<StoryResult<[E], ER>> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  const logger = getLogger(qpqConfig);

  const resolveStory = createRuntime(
    qpqConfig,
    {
      depth: 0,
      context: {},
    },
    async () => ({
      ...(await getDevServerActionProcessors(qpqConfig, dynamicModuleLoader)),
      ...(await getActionProcessors(qpqConfig, dynamicModuleLoader)),
    }),
    getDateNow,
    logger,
    `${serviceName}::${randomUUID()}`,
    qpqRuntimeType,
    dynamicModuleLoader,
    [],
  );

  const result = await resolveStory<[E]>(askProcessEvent, [expressEvent]);

  await logger.waitToFinishWriting();

  return result;
};
