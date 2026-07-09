import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import path from 'path';

export const setupRspackQPQRuntime = (qpqConfig: QPQConfig, buildPath: string): void => {
  const allSrcEntries = [...qpqCoreUtils.getAllSrcEntries(qpqConfig), ...qpqWebServerUtils.getAllSrcEntries(qpqConfig)];

  const customActionProcessorSources = qpqCoreUtils.getActionProcessorSources(qpqConfig);

  // set the qpq config env for loaders
  process.env.QPQLoaderConfig = JSON.stringify({
    allSrcEntries,
    rootDir: path.resolve(buildPath, '..'),
    qpqConfig,
    customActionProcessorSources,
    projectRoot: qpqCoreUtils.getConfigRoot(qpqConfig),
    userDirectoryEmailTemplates: qpqCoreUtils.getUserDirectoryEmailTemplates(qpqConfig),
  });
};

export const getResolveLoaderModules = () => [path.resolve(__dirname, 'loaders'), 'node_modules'];

export * from './appWorkspace';
export * from './federation';
export * from './getQpqBundleExternals';
export * from './getRspackBuildMode';
export * from './getRspackConfigForQpq';
export * from './plugins';
