import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export type WebpackBuildMode = 'none' | 'development' | 'production';

// Maps the service's environment to a webpack mode. Single source of truth for
// the static lambda build, the federated remote build, and any other consumer -
// so they never optimize/minify differently.
export const getWebpackBuildMode = (qpqConfig: QPQConfig): WebpackBuildMode => {
  const moduleEnvironment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig) as WebpackBuildMode;

  if (['development', 'production'].indexOf(moduleEnvironment) >= 0) {
    return moduleEnvironment;
  }

  return 'production';
};
