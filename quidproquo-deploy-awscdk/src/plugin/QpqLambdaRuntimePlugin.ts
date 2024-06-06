import path from 'path';
import { QPQConfig } from 'quidproquo-core';
import { Compiler, WebpackPluginInstance, sources } from 'webpack';

const awsLambdasToBuild = [
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

export const getWebpackEntries = () =>
  awsLambdasToBuild.reduce(
    (acc, name) => ({
      ...acc,
      [name]: path.join(__dirname, `../lambdas/${name}`),
    }),
    {},
  );

interface QpqLambdaRuntimePluginOptions {
  qpqConfig: QPQConfig;
}

export class QpqLambdaRuntimePlugin implements WebpackPluginInstance {
  private options: QpqLambdaRuntimePluginOptions;

  constructor(options: QpqLambdaRuntimePluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap('QpqLambdaRuntimePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'QpqLambdaRuntimePlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          // Add qpqConfig JSON file to the output assets
          const qpqConfigJson = JSON.stringify(this.options.qpqConfig, null, 2);
          const outputFileName = 'qpqConfig.json';
          assets[outputFileName] = new sources.RawSource(qpqConfigJson);

          console.log('Added qpqConfig.json to assets');
        },
      );
    });
  }
}
