import { QPQConfig, defineDeployEvent, defineQueue, defineGlobal, QpqFunctionRuntime } from 'quidproquo-core';
import { getServiceEntryQpqFunctionRuntime } from '../../services';

export const defineSeed = (buildPath: string, seeds: QpqFunctionRuntime[]): QPQConfig => {
  return [
    // Define a global so we can access the seeds from the src
    defineGlobal('qpqSeeds', seeds),

    // Listen to deploy events
    defineDeployEvent(buildPath, 'qpqSeeds', getServiceEntryQpqFunctionRuntime('seed', 'deployEvent', 'onDeploy::onDeploy')),

    // Build up a queue where the src names are the event types
    defineQueue(
      'qpqSeeds',
      buildPath,
      seeds.reduce(
        (acc, s) => ({
          ...acc,
          [s]: s,
        }),
        {},
      ),
      {
        maxConcurrentExecutions: 1,
        batchSize: 1,
        concurrency: 1,
      },
    ),
  ];
};
