// Shared TypeScript module rules for the QPQ backend service builds (static
// lambda bundles + federated remotes). The views build has its own
// react-flavoured swc options in getViewsRspackConfig. Dependency-specific
// build quirks (ignored modules/warnings) are config-driven via
// `defineBackendBundleOptions` — nothing package-specific lives here.
import { RuleSetRule } from '@rspack/core';

// TypeScript via rspack's builtin swc loader. Decorators on to match
// quidproquo-tsconfig; services are plain node code so no react transform.
const swcNodeOptions = (tsx: boolean) => ({
  jsc: {
    parser: { syntax: 'typescript', tsx, decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
    target: 'es2021',
  },
});

export const serviceTsRules = (): RuleSetRule[] => [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    loader: 'builtin:swc-loader',
    options: swcNodeOptions(false),
  },
  {
    test: /\.tsx$/,
    exclude: /node_modules/,
    loader: 'builtin:swc-loader',
    options: swcNodeOptions(true),
  },
  {
    // Emit referenced txt/map assets as files next to the bundle.
    test: /\.(txt|map)$/,
    type: 'asset/resource',
  },
];
