// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import path from 'path';
import { QPQConfig,qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

type WebpackBuildMode = 'none' | 'development' | 'production';

export const getWebpackBuildMode = (qpqConfig: QPQConfig): WebpackBuildMode => {
  const feature = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig) as WebpackBuildMode;

  if (['development', 'production'].indexOf(feature) >= 0) {
    return feature;
  }

  return 'production';
};

export const setupWebpackQPQRuntime = (qpqConfig: QPQConfig, buildPath: string): void => {
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

export * from './getWebpackConfigForQpq';
export * from './plugins';
