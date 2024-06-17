import { QPQConfig } from 'quidproquo-core';
import { Compiler, WebpackPluginInstance, sources } from 'webpack';

interface QpqPluginOptions {
  qpqConfig: QPQConfig;
}

export class QpqPlugin implements WebpackPluginInstance {
  private options: QpqPluginOptions;

  constructor(options: QpqPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.emit.tapAsync('QpqPlugin', (compilation, callback) => {
      // Add qpqConfig JS file to the output assets!
      const qpqConfigJs = `module.exports = ${JSON.stringify(this.options.qpqConfig, null, 2)};`;
      const outputFileName = 'qpqPlugin/config.js';
      compilation.emitAsset(outputFileName, new sources.RawSource(qpqConfigJs));

      callback();
    });
  }
}
