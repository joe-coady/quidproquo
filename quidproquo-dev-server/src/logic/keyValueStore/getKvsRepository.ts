import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { ResolvedDevServerConfig } from '../../types';
import { JsonKvsRepository } from './JsonKvsRepository';
import { KvsRepository } from './KvsRepository';

// One repository instance per service, shared across all 6 KVS action processors.
// A JsonKvsRepository keeps its store data in memory, so separate instances per
// processor would each hold a divergent copy - this cache is what makes that safe.
const repositoryInstances = new Map<string, KvsRepository>();

export const getKvsRepository = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KvsRepository => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  if (!repositoryInstances.has(serviceName)) {
    repositoryInstances.set(serviceName, new JsonKvsRepository(devServerConfig.runtimePath, qpqConfig));
  }

  return repositoryInstances.get(serviceName)!;
};
