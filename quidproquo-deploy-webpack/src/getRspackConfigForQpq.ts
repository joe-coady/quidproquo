import { QPQConfig } from 'quidproquo-core';

import { Configuration } from '@rspack/core';

import { getRspackBuildMode } from './getRspackBuildMode';
import { QpqPlugin } from './plugins';

export const getRspackConfig = (qpqConfig: QPQConfig, buildPath: string, entries: Record<string, string>, nodeModulePath: string): Configuration => {
  return {
    entry: entries,

    mode: getRspackBuildMode(qpqConfig),

    externals: [/aws-sdk/],

    target: 'node',
    output: {
      // Output path
      path: buildPath,
      filename: '[name]/index.js',

      // Allow compiling as a lib ~ don't tree shake my exports plz
      globalObject: 'this',
      library: { type: 'commonjs2' },
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      fallback: {},
    },

    plugins: [new QpqPlugin({ qpqConfigs: [qpqConfig], nodeModulePath })],

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

export const getAllRspackConfig = (qpqConfig: QPQConfig, entries: Record<string, string>, outputPath?: string, nodeModulePath?: string) =>
  getRspackConfig(qpqConfig, outputPath || 'build', entries, nodeModulePath || 'node_modules');
