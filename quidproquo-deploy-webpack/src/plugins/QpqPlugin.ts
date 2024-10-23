import { QPQConfig } from 'quidproquo-core';

import { Compiler, WebpackPluginInstance } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

import { getQpqDyanmicLoaderSrcFromQpqConfigs } from './getQpqDyanmicLoaderSrcFromQpqConfigs';

interface QpqPluginOptions {
  qpqConfigs: QPQConfig[];
}

export class QpqPlugin implements WebpackPluginInstance {
  private options: QpqPluginOptions;

  constructor(options: QpqPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    new VirtualModulesPlugin({
      'node_modules/quidproquo-dynamic-loader.js': getQpqDyanmicLoaderSrcFromQpqConfigs(this.options.qpqConfigs),
    }).apply(compiler);
  }
}
