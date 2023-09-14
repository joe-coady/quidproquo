import { QPQConfig, defineDeployEvent, defineKeyValueStore, QpqSourceEntry, DeployEventType, defineQueue, defineGlobal } from 'quidproquo-core';

import { getServiceEntry } from '../../utils/serviceConfig';

export const defineSeed = (buildPath: string, seeds: QpqSourceEntry[]): QPQConfig => {

  return [
    // Define a global so we can access the seeds from the src
    defineGlobal('qpqSeeds', seeds),

    // Listen to deploy events
    defineDeployEvent(buildPath, 'qpqSeeds', {
      src: getServiceEntry('seed', 'deployEvent', 'onDeploy'),
      runtime: 'onDeploy'
    }),
  
    // Build up a queue where the src names are the event types
    defineQueue('qpqSeeds', buildPath, seeds.reduce((acc, s) => ({
      ...acc,
      [s.src]: s
    }), {}), {
      maxConcurrentExecutions: 1,
      batchSize: 1,
      concurrency: 1
    })
  ];
};
