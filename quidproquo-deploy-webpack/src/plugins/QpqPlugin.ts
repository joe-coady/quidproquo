import { QPQConfig } from 'quidproquo-core';

import path from 'path';
import { Compiler, WebpackPluginInstance } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

import { getQpqDyanmicLoaderSrcFromQpqConfigs } from './getQpqDyanmicLoaderSrcFromQpqConfigs';

interface QpqPluginOptions {
  qpqConfigs: QPQConfig[];
  nodeModulePath: string;
  aliases?: Record<string, string>;
}

export class QpqPlugin implements WebpackPluginInstance {
  private options: QpqPluginOptions;

  constructor(options: QpqPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    if (this.options.aliases && Object.keys(this.options.aliases).length > 0) {
      compiler.options.resolve = compiler.options.resolve || {};
      compiler.options.resolve.alias = {
        ...(compiler.options.resolve.alias as Record<string, string> || {}),
        ...this.options.aliases,
      };
    }

    new VirtualModulesPlugin({
      [path.resolve(this.options.nodeModulePath, 'quidproquo-dynamic-loader.js')]: getQpqDyanmicLoaderSrcFromQpqConfigs(this.options.qpqConfigs),
    }).apply(compiler);
  }
}
