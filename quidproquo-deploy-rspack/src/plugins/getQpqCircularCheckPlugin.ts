// Circular import detection for every QPQ rspack build (dev server, lambda
// bundles, service remotes, views).
//
// A module cycle is only conditionally safe: it works or breaks depending on
// which file happens to be the entry point into the cycle (ESM throws a TDZ
// ReferenceError, CJS silently gives a partial exports object). We treat every
// cycle as a defect. Third-party packages are excluded — workspace and linked
// packages resolve through symlinks to their real paths outside node_modules,
// so first-party code is always checked.
//
// Cycles are reported through onDetected with a direct console print because
// several build paths suppress warnings (views dev runs stats:'errors-only');
// they are also pushed as compilation warnings so stats/CI output has them.
// Set QPQ_CIRCULAR_DEPS_ERROR=1 to promote cycles to build errors.
import { CircularCheckRspackPlugin, RspackPluginInstance } from '@rspack/core';

export const getQpqCircularCheckPlugin = (): RspackPluginInstance =>
  new CircularCheckRspackPlugin({
    exclude: /node_modules/,
    onDetected: ({ paths, compilation }) => {
      const message = `Circular dependency detected:\n    ${paths.join('\n  → ')}`;

      console.warn(`\x1b[33m[qpq] ${message}\x1b[0m`);

      const diagnostic = new Error(`[qpq] ${message}`);
      if (process.env.QPQ_CIRCULAR_DEPS_ERROR) {
        compilation.errors.push(diagnostic);
      } else {
        compilation.warnings.push(diagnostic);
      }
    },
  });
