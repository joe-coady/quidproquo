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
      // const entryFiles = Object.keys(compiler.options.entry);
      // entryFiles.forEach((entryName) => {
      //   const assetName = `${entryName}.js`;
      //   if (compilation.assets[assetName]) {
      //     console.log('Doing: ', entryName);
      //     const bundledFile = compilation.assets[assetName];
      //     const wrappedSource = `
      //       (function() {
      //         var exports = {};
      //         var module = { exports: exports };
      //         ${bundledFile.source().toString()}
      //         return module.exports;
      //       })();
      //     `;

      //     // Replace the bundle with the wrapped version
      //     compilation.assets[assetName] = new sources.RawSource(wrappedSource);
      //   }
      // });

      // Add qpqConfig JSON file to the output assets!
      const qpqConfigJson = JSON.stringify(this.options.qpqConfig, null, 2);
      const outputFileName = 'qpqConfig.json';
      compilation.assets[outputFileName] = new sources.RawSource(qpqConfigJson);

      callback();
    });
  }
}
