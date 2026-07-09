// Rspack config for building a QPQ backend service as a MODULE FEDERATION REMOTE.
//
// Companion to getServiceRspackConfig: that one builds the per-handler lambda
// zips (the deployed code). This one builds the same service's story code as a
// single federated container (remoteEntry.js + expose/shared chunks) that gets
// published to the service's federated code bucket. Once published, deployed
// lambdas load their stories from the bucket instead of the bundled if-chain
// (the dynamicModuleLoader tries federation first, falls back to bundled).
//
// getRspackConfigForQpqRemote supplies target 'async-node', the
// ModuleFederationPlugin (exposes auto-derived from every QpqFunctionRuntime,
// quidproquo-core/webserver shared), and chunked output. On top we add the same
// swc-loader getServiceRspackConfig uses. We deliberately do NOT copy its
// splitChunks:false / eager-import settings — federation NEEDS async chunks.
import { QPQConfig } from 'quidproquo-core';

import path from 'path';
import { Configuration } from '@rspack/core';

import { getRspackConfigForQpqRemote } from '../federation';
import { serviceTsRules } from './serviceRspackShared';

// Derive the remote output location from the service directory
// (apps/<app>/services/<svc>/service). Output goes to a `service-remote` sibling
// of the static `service` build so the two never clobber each other.
const resolvePaths = (serviceDir: string) => {
  const parts = serviceDir.split(path.sep);
  const appsIdx = parts.lastIndexOf('apps');
  if (appsIdx < 0 || parts[appsIdx + 2] !== 'services' || parts[appsIdx + 4] !== 'service') {
    throw new Error(`Expected apps/<app>/services/<svc>/service, got ${serviceDir}`);
  }
  const root = parts.slice(0, appsIdx).join(path.sep);
  const appName = parts[appsIdx + 1];
  const serviceName = parts[appsIdx + 3];
  return {
    remoteBuildPath: path.join(root, 'dist', 'apps', appName, 'services', serviceName, 'service-remote'),
  };
};

export const getServiceRemoteRspackConfig = (qpqConfig: QPQConfig, serviceDir: string): Configuration => {
  const { remoteBuildPath } = resolvePaths(serviceDir);

  const qpqRemote = getRspackConfigForQpqRemote(qpqConfig, remoteBuildPath);

  return {
    ...qpqRemote,

    resolve: {
      ...qpqRemote.resolve,
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
      ...qpqRemote.module,
      rules: [...(qpqRemote.module?.rules ?? []), ...serviceTsRules()],
    },
  };
};
