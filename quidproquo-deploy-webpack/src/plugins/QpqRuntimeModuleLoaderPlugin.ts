import { QPQConfig } from 'quidproquo-core';
import { Compiler, WebpackPluginInstance, sources } from 'webpack';

interface QpqRuntimeModuleLoaderPluginOptions {
  qpqConfig: QPQConfig;
}

export class QpqRuntimeModuleLoaderPlugin implements WebpackPluginInstance {
  private options: QpqRuntimeModuleLoaderPluginOptions;

  constructor(options: QpqRuntimeModuleLoaderPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('QpqRuntimeModuleLoaderPlugin', (compilation, callback) => {
      // Add qpqConfig JSON file to the output assets
      const qpqConfigJson = JSON.stringify(this.options.qpqConfig, null, 2);
      const outputFileName = 'qpqConfig.json';
      compilation.assets[outputFileName] = new sources.RawSource(qpqConfigJson);

      callback();
    });
  }
}
