// ─────────────────────────────────────────────────────────────────────────────
// The webpack config that compiles a service's story code into a module-federation
// REMOTE container (remoteEntry.js + expose/shared chunks). This is step 2 of the
// build/publish flow:
//   1. getFederatedRemoteInfoForQpqConfig -> container name + exposes
//   2. getWebpackConfigForQpqRemote (HERE) -> the container build in `buildPath`
//   3. publishFederatedRemote -> hash + manifest, ready to copy into the store bucket
//
// This is the counterpart to getWebpackConfigForQpq (the normal per-handler lambda
// build). The container is `target: async-node` + a commonjs-module library so the
// lambda can require() it from /tmp, and `shared` keeps the framework packages OUT of
// the bundle (the host provides them), so a remote carries only user code.
// ─────────────────────────────────────────────────────────────────────────────
import { FEDERATED_SHARED_PACKAGE_NAMES } from 'quidproquo-actionprocessor-awslambda';
import { QPQConfig } from 'quidproquo-core';

import { Configuration } from 'webpack';
import { ModuleFederationPlugin } from '@module-federation/enhanced';

import { getWebpackBuildMode } from '../getWebpackBuildMode';
import { getFederatedRemoteInfoForQpqConfig } from './getFederatedRemoteInfoForQpqConfig';

// The framework packages the lambda host provides as MF singletons. Built from the
// same list the host uses (getHostSharedModules) so the two can't drift, which would
// otherwise make the remote bundle its own copy and break singleton guarantees.
const getSharedFrameworkModules = (): Record<string, { singleton: true; requiredVersion: false }> =>
  Object.fromEntries(FEDERATED_SHARED_PACKAGE_NAMES.map((name) => [name, { singleton: true as const, requiredVersion: false as const }]));

// Builds the service's story code as a module federation remote container - the thing
// publishFederatedRemote packages and the lambda-side loadFederatedStory consumes.
// Everything the stories import is bundled in EXCEPT the framework packages listed in
// `shared`, which the lambda host provides so both sides use the same module instances.
//
// Like getWebpackConfig, this config has no TS loader rule - consumer apps append the
// same module rules they use for their main qpq build.
export const getWebpackConfigForQpqRemote = (qpqConfig: QPQConfig, buildPath: string): Configuration => {
  const { containerName, exposes } = getFederatedRemoteInfoForQpqConfig(qpqConfig);

  return {
    // The federation container is the only entry - the exposes drive the module graph
    entry: {},

    mode: getWebpackBuildMode(qpqConfig),
    devtool: false,

    // async-node chunk loading resolves sibling chunks from the entry's own directory
    // at runtime, which is what lets the container run from the lambda's /tmp cache
    target: 'async-node',

    output: {
      path: buildPath,
      publicPath: 'auto',
      filename: '[name].js',
      chunkFilename: '[id]-[contenthash].js',
      uniqueName: containerName,
      globalObject: 'this',
      clean: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      fallback: {},
    },

    plugins: [
      new ModuleFederationPlugin({
        name: containerName,
        filename: 'remoteEntry.js',
        exposes,
        library: { type: 'commonjs-module', name: containerName },
        remoteType: 'script',
        runtimePlugins: [require.resolve('@module-federation/node/runtimePlugin')],
        shared: getSharedFrameworkModules(),
        // No consumer imports these remotes by type, and the DTS fork crashes trying
        // to resolve a rootDir from the programmatic build's tsconfig - so skip type
        // generation entirely (publishFederatedRemote drops @mf-types anyway).
        dts: false,
      }),
    ],

    module: {
      rules: [
        {
          test: /\.(yaml|json)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },

    ignoreWarnings: [
      {
        module: /@module-federation/,
        message: /Failed to parse source map/,
      },
    ],
  };
};
