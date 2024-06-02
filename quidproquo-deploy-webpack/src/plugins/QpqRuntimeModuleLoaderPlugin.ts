import { Compiler, WebpackPluginInstance, sources } from 'webpack';

export class QpqRuntimeModuleLoaderPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('QpqRuntimeModuleLoaderPlugin', (compilation, callback) => {
      const entryFiles = Object.keys(compiler.options.entry);

      entryFiles.forEach((entryName) => {
        const assetName = `${entryName}.bundle.js`;
        if (compilation.assets[assetName]) {
          const bundledFile = compilation.assets[assetName];
          const wrappedSource = `
            (function() {
              var exports = {};
              var module = { exports: exports };
              ${bundledFile.source().toString()}
              return module.exports;
            })();
          `;

          // Replace the bundle with the wrapped version
          compilation.assets[assetName] = new sources.RawSource(wrappedSource);
        }
      });

      callback();
    });
  }
}
