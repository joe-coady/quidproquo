// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import path from 'path';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

type WebpackBuildMode = 'none' | 'development' | 'production';

const getWebpackBuildMode = (qpqConfig: QPQConfig): WebpackBuildMode => {
  const feature = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig) as WebpackBuildMode;

  if (['development', 'production'].indexOf(feature) >= 0) {
    return feature;
  }

  return 'production';
};

export const getWebpackConfig = (qpqConfig: QPQConfig, buildPath: string, awsLambdasToBuild: string[]) => {
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

  return {
    entry: awsLambdasToBuild.reduce((acc, name) => ({ ...acc, [name]: `quidproquo-deploy-awscdk/src/lambdas/${name}.ts` }), {}),

    resolveLoader: {
      modules: [path.resolve(__dirname, 'loaders'), 'node_modules'],
    },

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
        path: require.resolve('path-browserify'),
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
          // exclude: /node_modules/,
        },
        {
          test: /\.(yaml|json)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },
    // plugins: [new BundleAnalyzerPlugin()],
  };
};

export const getWebpackEntryNames = () => [
  'lambdaAPIGatewayEvent',
  'lambdaAPIGatewayEvent_redirect',
  'lambdaWebsocketAPIGatewayEvent',
  'lambdaEventBridgeEventStackDeploy',
  'lambdaEventBridgeEvent',
  'lambdaEventOriginRequest',
  'lambdaEventViewerRequest',
  'lambdaServiceFunctionExecute',
  'lambdaSQSEvent',
  'lambdaS3FileEvent',

  'lambdaCognitoTriggerEvent_CustomMessage',
];

export const getSeoWebpackConfig = (qpqConfig: QPQConfig, outputPath?: string) =>
  getWebpackConfig(qpqConfig, outputPath || 'build', ['lambdaEventOriginRequest', 'lambdaEventViewerRequest', 'lambdaAPIGatewayEvent_redirect']);

export const getApiWebpackConfig = (qpqConfig: QPQConfig, outputPath?: string) =>
  getWebpackConfig(qpqConfig, outputPath || 'build', [
    'lambdaEventBridgeEventStackDeploy',
    'lambdaEventBridgeEvent',
    'lambdaAPIGatewayEvent',
    'lambdaWebsocketAPIGatewayEvent',
    'lambdaServiceFunctionExecute',
    'lambdaSQSEvent',
    'lambdaS3FileEvent',

    'lambdaCognitoTriggerEvent_CustomMessage',
  ]);

export const getAllWebpackConfig = (qpqConfig: QPQConfig, outputPath?: string) =>
  getWebpackConfig(qpqConfig, outputPath || 'build', getWebpackEntryNames());
