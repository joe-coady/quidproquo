import path from 'path';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import webpack from 'webpack';

const getWebpackBuildMode = (qpqConfig: QPQConfig): string => {
  const feature = qpqCoreUtils.getAppFeature(qpqConfig);

  if (['development', 'production'].indexOf(feature) >= 0) {
    return feature;
  }

  return 'production';
};

export const getWebpackConfig = (qpqConfig: QPQConfig, buildPath: string, outputPrefix: string) => {
  const allSrcEntries = [
    ...qpqCoreUtils.getAllSrcEntries(qpqConfig),
    ...qpqWebServerUtils.getAllSrcEntries(qpqConfig),
  ];

  // set the qpq config env for loaders
  process.env.QPQLoaderConfig = JSON.stringify({
    allSrcEntries,
    rootDir: path.resolve(buildPath, '..'),
  });

  return {
    // entry: allSrcEntries.reduce(
    //   (entry, path) => ({
    //     ...entry,
    //     [`./${outputPrefix}/${path}`]: `./${path}`,
    //   }),
    //   {},
    // ),

    entry: {
      lambdaAPIGatewayEvent: 'quidproquo-deploy-awslambda/src/lambdas/lambdaAPIGatewayEvent.ts',
      lambdaEventBridgeEvent: 'quidproquo-deploy-awslambda/src/lambdas/lambdaEventBridgeEvent.ts',
    },

    resolveLoader: {
      modules: [path.resolve(__dirname, 'loaders'), 'node_modules'],
    },

    // mode: getWebpackBuildMode(qpqConfig),
    mode: 'production',

    // We should: sort out how to split the bundles and get it to work on aws
    // optimization: {
    //   splitChunks: {
    //     // include all types of chunks
    //     chunks: "all",
    //   },
    // },

    target: 'node',
    output: {
      // Output path
      path: buildPath,
      filename: '[name].js',

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

    module: {
      rules: [
        {
          test: /\.(ts)$/,
          loader: 'babel-loader',
          options: {
            // without additional settings, this will reference .babelrc
            presets: ['@babel/preset-typescript'],
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(yaml|json)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },
  };
};
