import { QPQConfig } from 'quidproquo-core';
import { Compiler, WebpackPluginInstance } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { getQpqDyanmicLoaderSrcFromQpqConfig } from './getQpqDyanmicLoaderSrcFromQpqConfig';

interface QpqPluginOptions {
  qpqConfig: QPQConfig;
}

export class QpqPlugin implements WebpackPluginInstance {
  private options: QpqPluginOptions;

  constructor(options: QpqPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    new VirtualModulesPlugin({
      'node_modules/quidproquo-dynamic-loader.js': getQpqDyanmicLoaderSrcFromQpqConfig(this.options.qpqConfig),
    }).apply(compiler);
  }
}
