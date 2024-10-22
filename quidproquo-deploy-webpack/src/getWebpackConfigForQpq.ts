// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { Configuration } from 'webpack';
import { QpqPlugin } from './plugins';

type WebpackBuildMode = 'none' | 'development' | 'production';

const getWebpackBuildMode = (qpqConfig: QPQConfig): WebpackBuildMode => {
  const feature = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig) as WebpackBuildMode;

  if (['development', 'production'].indexOf(feature) >= 0) {
    return feature;
  }

  return 'production';
};

export const getWebpackConfig = (qpqConfig: QPQConfig, buildPath: string, entries: Record<string, string>): Configuration => {
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
      fallback: {
        crypto: false,
      },
    },

    plugins: [new QpqPlugin({ qpqConfigs: [qpqConfig] })],

    module: {
      rules: [
        {
          test: /\.(yaml|json)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },
  };
};

export const getAllWebpackConfig = (qpqConfig: QPQConfig, entries: Record<string, string>, outputPath?: string) =>
  getWebpackConfig(qpqConfig, outputPath || 'build', entries);