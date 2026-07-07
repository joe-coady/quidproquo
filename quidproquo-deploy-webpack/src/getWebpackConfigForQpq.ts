// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { QPQConfig } from 'quidproquo-core';

import { Configuration } from 'webpack';

import { getWebpackBuildMode } from './getWebpackBuildMode';
import { QpqPlugin } from './plugins';

export const getWebpackConfig = (qpqConfig: QPQConfig, buildPath: string, entries: Record<string, string>, nodeModulePath: string): Configuration => {
  return {
    entry: entries,

    mode: getWebpackBuildMode(qpqConfig),
    // mode: 'production',

    externals: [/aws-sdk/],

    target: 'node',
    output: {
      // Output path
      path: buildPath,
      filename: '[name]/index.js',

      // Allow compiling as a lib ~ don't tree shake my exports plz
      globalObject: 'this',
      libraryTarget: 'commonjs2',
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

export const getAllWebpackConfig = (qpqConfig: QPQConfig, entries: Record<string, string>, outputPath?: string, nodeModulePath?: string) =>
  getWebpackConfig(qpqConfig, outputPath || 'build', entries, nodeModulePath || 'node_modules');
