# Package Inventory & Self-Implementation Audit

> Goal: catalogue every **third-party** dependency across the monorepo's `package.json` files so we can
> work down the list and remove as many as we reasonably can.

**Scope & exclusions.** This lists every external package found in any workspace (and the non-workspace
`federation-poc/` and `quidproquo-docusaurus/` dirs). It **excludes**:

- All `quidproquo-*` internal workspace packages.
- All AWS packages: `@aws-sdk/*`, `@aws-cdk/*`, `aws-cdk-lib`, `constructs`, `aws-jwt-verify`,
  `@ai-sdk/amazon-bedrock`, `@types/aws-lambda`.

**Ordering.** Easiest-to-replace first → hardest last. Each entry carries a **DIY difficulty score (0–100)**
judged *only against the slice of the library we actually use* — not the library's full feature set:

| Score | Meaning |
|------:|---------|
| 0 | Unused, or a literal one-liner |
| 1–15 | Very easy — small self-contained helper |
| 16–35 | Easy to moderate — a day's work |
| 36–65 | Moderate to hard — real engineering |
| 66–85 | Hard — effectively its own mini-project |
| 86–100 | Impractical — foundational infrastructure |

**Total packages catalogued: 81.**

> `[ ]` = still a dependency. Tick the box as each one is removed or replaced.

## Checklist (easiest → hardest to remove)

- [ ] `dayjs` - 0/100 - unused (declared, never imported)
- [ ] `liquidjs` - 0/100 - unused (no Liquid templates anywhere)
- [ ] `lodash` - 0/100 - unused (no imports; +@types/lodash stale)
- [ ] `path-browserify` - 0/100 - unused (empty webpack fallback)
- [ ] `react-icons` - 0/100 - unused (MUI icons used instead)
- [ ] `vite` - 0/100 - unused (transitive via vitest/config)
- [ ] `@types/*` - 1/100 - TS type stubs for JS libs (vanish when libs ship own types)
- [ ] `symbol-observable` - 2/100 - Symbol.observable ponyfill — ~1 line
- [ ] `clsx` - 3/100 - conditional classNames (docs/transitive only)
- [ ] `upath` - 3/100 - cross-platform path normalization
- [ ] `chalk` - 5/100 - colored dev-server console output
- [ ] `d3` - 5/100 - unused (declared, never imported)
- [ ] `undici` - 5/100 - HTTP client (federation-poc only)
- [ ] `globals` - 8/100 - eslint global-var presets
- [ ] `tsx` - 8/100 - run .ts scripts directly
- [ ] `uuid` - 8/100 - v4 GUID generation
- [ ] `@mui/lab` - 10/100 - experimental MUI components
- [ ] `sqlite` - 12/100 - promise wrapper over sqlite3
- [ ] `concurrently` - 15/100 - run parallel npm scripts (POC only)
- [ ] `react-time-ago` - 15/100 - relative-time React component
- [ ] `react-markdown` - 20/100 - render markdown in admin UI
- [ ] `tsconfig-paths` - 20/100 - resolve tsconfig path aliases (webpack)
- [ ] `node-cache` - 22/100 - in-memory TTL cache
- [ ] `html-webpack-plugin` - 25/100 - generate index.html (webpack)
- [ ] `uuidv7` - 25/100 - sortable time-based UUIDs
- [ ] `javascript-time-ago` - 28/100 - localized relative-time formatting
- [ ] `jotai` - 28/100 - atom state in web-react runtime
- [ ] `node-match-path` - 31/100 - route path matching / param extraction
- [ ] `@anthropic-ai/sdk` - 35/100 - Claude API types/client
- [ ] `chokidar` - 35/100 - file watching (dev-server)
- [ ] `eslint-plugin-simple-import-sort` - 35/100 - import-sort lint rule
- [ ] `react-router-dom` - 35/100 - admin SPA routing
- [ ] `busboy` - 38/100 - multipart/form-data parsing (lambda)
- [ ] `@module-federation/node` - 45/100 - federation runtime (POC only)
- [ ] `react-inspector` - 45/100 - JSON/object tree inspector UI
- [ ] `prism-react-renderer` - 50/100 - code syntax highlighting (docs only)
- [ ] `ai` - 52/100 - Vercel AI SDK (Bedrock text/streaming)
- [ ] `jsonwebtoken` - 52/100 - JWT sign/verify
- [ ] `multer` - 52/100 - express file-upload middleware (dev-server)
- [ ] `recharts` - 52/100 - charts in admin UI
- [ ] `date-fns` - 55/100 - MUI date-picker adapter
- [ ] `immer` - 55/100 - immutable state in core runtime
- [ ] `jwks-rsa` - 58/100 - fetch/cache JWKS public keys
- [ ] `prettier` - 58/100 - code formatting (all workspaces)
- [ ] `@mdx-js/react` - 60/100 - MDX rendering (docs only)
- [ ] `@vitest/coverage-v8` - 62/100 - test coverage reports
- [ ] `@mui/x-date-pickers` - 65/100 - date/time pickers
- [ ] `axios` - 65/100 - HTTP client (network actions)
- [ ] `ws` - 68/100 - websocket server (dev-server)
- [ ] `@emotion/styled` - 70/100 - styled-components (MUI engine)
- [ ] `@eslint/js` - 70/100 - eslint recommended ruleset
- [ ] `react-d3-tree` - 70/100 - correlation/story tree viz
- [ ] `@emotion/react` - 72/100 - CSS-in-JS (MUI engine)
- [ ] `webpack-virtual-modules` - 72/100 - in-memory entry modules (deploy-webpack)
- [ ] `@mui/icons-material` - 75/100 - Material icons
- [ ] `@mui/x-data-grid` - 75/100 - data grid / table
- [ ] `@vitest/ui` - 78/100 - test UI dashboard
- [ ] `xstate` - 78/100 - state machines (xstate pkg)
- [ ] `ts-loader` - 80/100 - webpack TS loader (POC only)
- [ ] `@mui/material` - 85/100 - core Material UI components
- [ ] `vitest` - 85/100 - test runner
- [ ] `@babel/core` - 86/100 - unused (build uses tsc)
- [ ] `@babel/plugin-transform-react-jsx` - 86/100 - JSX transform (webpack)
- [ ] `@babel/preset-env` - 86/100 - JS down-leveling (webpack)
- [ ] `@babel/preset-react` - 86/100 - unused (build uses tsc)
- [ ] `@babel/preset-typescript` - 86/100 - TS transpile (webpack)
- [ ] `babel-loader` - 86/100 - webpack↔babel bridge
- [ ] `eslint` - 86/100 - linter
- [ ] `webpack-cli` - 86/100 - webpack CLI (admin build)
- [ ] `webpack-dev-server` - 86/100 - admin dev server / HMR
- [ ] `@module-federation/enhanced` - 88/100 - runtime federated addons (admin)
- [ ] `typescript-eslint` - 88/100 - TS support for eslint
- [ ] `webpack` - 88/100 - module bundler (admin / deploy)
- [ ] `@docusaurus/preset-classic` - 90/100 - docs theme/preset (docs only)
- [ ] `esbuild` - 90/100 - bundle lambda log extension
- [ ] `@docusaurus/core` - 95/100 - docs site generator (docs only)
- [ ] `jsdom` - 95/100 - DOM env for tests
- [ ] `react-dom` - 95/100 - render React to DOM
- [ ] `sqlite3` - 95/100 - native SQLite driver (dev-server)
- [ ] `react` - 100/100 - UI framework
- [ ] `typescript` - 100/100 - language / compiler

---


## Full details (easiest → hardest)

## Tier 0 — Unused or near-trivial (likely free removals)

_These appear unused in our source (only declared in `package.json`) or are one-liners. Removing or inlining them should cost almost nothing — verify, then delete._

### `[ ]` `dayjs`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A lightweight date library (2KB alternative to Moment.js) with a similar API for immutable date/time operations.

dayjs is listed as a dependency in quidproquo-web-admin's package.json but is not actually used anywhere in the codebase. It appears to be an unused dependency that could be removed.

**Write our own?** N/A - the package is not used; no replacement is needed.

### `[ ]` `liquidjs`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-awscdk`

Shopify Liquid template engine for JavaScript.

Liquidjs is listed as a dependency in quidproquo-deploy-awscdk's package.json but is not actually imported or used anywhere in the codebase. No template files using Liquid syntax were found, and no code references Liquid or template rendering functionality. It appears to be an unused dependency.

**Write our own?** Not applicable - the package is not used in the codebase.

### `[ ]` `lodash`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

A utility library providing functional programming helpers for common operations on arrays, objects, and functions.

Lodash is listed as a direct dependency in quidproquo-actionprocessor-awslambda's package.json but is not actually imported or used anywhere in the package's TypeScript source code. The @types/lodash dev dependency is also declared but unused. Analysis of all .ts/.js files in the src/ directory and the Lambda extension layer source (qpqLogExtension/index.ts) shows no lodash imports, method calls, or references. Lodash appears to be a stale dependency that may have been removed during refactoring.

**Write our own?** Not applicable — this dependency appears to be unused in the codebase and should be removed rather than reimplemented.

### `[ ]` `path-browserify`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

Browserified version of Node.js path module for use in browsers.

Path-browserify is listed as a dependency in quidproquo-deploy-webpack and quidproquo-web-admin package.json files but is not explicitly imported or used anywhere in the source code. The webpack fallback configuration in quidproquo-deploy-webpack/src/getWebpackConfigForQpq.ts has an empty fallback object, suggesting it was either planned for use or included as a transitive dependency. No explicit require() or import statements reference it.

**Write our own?** Not applicable - the package is not actively used in code. If it were needed as a webpack fallback for the path module, we could let webpack's built-in polyfillfill handle it or configure a custom fallback.

### `[ ]` `react-icons`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A library providing popular SVG icon packs (Font Awesome, Bootstrap Icons, Feather, etc.) as importable React components.

react-icons is listed as a dependency in quidproquo-web-admin's package.json (v4.8.0) but is not actually used anywhere in the codebase. All icon needs are met by @mui/icons-material instead (e.g., LockIcon, ExpandMoreIcon), which is the standard icon library for Material-UI.

**Write our own?** N/A - the package is not used; instead, @mui/icons-material provides all required icons.

### `[ ]` `vite`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 0/100 &nbsp;·&nbsp; **Used in:** `quidproquo`

JavaScript bundler and development server for web applications.

Vite is installed as a root devDependency but not directly used in the monorepo. The dependency is present as a base for vitest/config imports (vitest/config internally depends on vite and re-exports defineConfig), but the monorepo does not use Vite as a bundler, asset processor, or dev server. All vitest configs import from 'vitest/config', not directly from Vite.

**Write our own?** Not applicable — Vite is not actively used by the repo. It's a transitive dependency pulled in by vitest.


## Tier 1 — Very easy (small self-contained helpers)

_Tiny, well-understood utilities. A focused in-house helper of a few dozen lines covers what we use._

### `[ ]` `@types/*`

**Category:** types &nbsp;·&nbsp; **DIY difficulty:** 1/100 &nbsp;·&nbsp; **Used in:** `quidproquo-core`, `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-web`, `quidproquo-actionprocessor-awslambda`, `quidproquo-deploy-webpack`, `quidproquo-deploy-awscdk`, `quidproquo-dev-server`, `quidproquo-web-admin`

TypeScript type definition packages providing type stubs for JavaScript libraries and Node.js APIs.

The repo uses @types/* packages across multiple development scenarios. @types/node (in quidproquo-core, quidproquo-actionprocessor-awslambda, quidproquo-deploy-webpack/awscdk, quidproquo-dev-server, quidproquo-web-admin) provides types for Node.js built-in modules (fs, path, http, events) used extensively in 25+ source files for file operations, path resolution, and HTTP server creation. @types/uuid (quidproquo-actionprocessor-js/node/web) provides types for the uuid library used in getGuidNewActionProcessor.ts to generate UUIDs with `v4()`. @types/busboy (quidproquo-actionprocessor-awslambda) types the busboy multipart form parser used in parseMultipartFormData.ts for handling file uploads in AWS Lambda. @types/jsonwebtoken (quidproquo-actionprocessor-awslambda) types the jsonwebtoken decode/verify functions used in decodeValidJwt.ts for JWT validation. @types/multer (quidproquo-dev-server) types the multer middleware used in fileStorageImplementation.ts and apiImplementation.ts for handling file uploads. @types/sqlite3 (quidproquo-dev-server) provides types for sqlite3 module used in SqliteKvsRepository.ts for key-value store operations. @types/react and @types/react-dom (quidproquo-web-admin) type React components and hooks throughout src/App, src/Auth, and src/components. @types/webpack and @types/webpack-dev-server (quidproquo-web-admin) provide types for webpack configuration and dev server setup in devDependencies. @types/babel__traverse (quidproquo-deploy-webpack, quidproquo-deploy-awscdk) is a devDependency for Babel AST traversal used by build tools. @types/prettier (quidproquo-deploy-webpack, quidproquo-deploy-awscdk) is a devDependency providing types for the prettier code formatter. @types/lodash is listed as a devDependency in quidproquo-actionprocessor-awslambda but lodash is never actually imported in the source, suggesting it may be an indirect dependency.

**Write our own?** Writing our own type definitions would be impractical—these are thin, specialized type mapping layers for third-party libraries. If libraries ship their own types (increasingly common), these packages can be removed without replacement. For libraries that won't provide types, writing stubs would require maintaining definition files across all versions and API changes.

### `[ ]` `symbol-observable`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 2/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-react`

A polyfill/ponyfill that adds the Symbol.observable property for making objects compatible with the Observable specification.

Imported as a side-effect-only import (`import 'symbol-observable'`) at the top of quidproquo-web-react/src/index.ts. This polyfills Symbol.observable globally, enabling compatibility with libraries expecting the Observable pattern (e.g., Redux integration, state management libraries that follow the Observable spec). The import ensures the symbol exists on the global Symbol object.

**Write our own?** Symbol.observable is a single global property assignment. The ponyfill is a one-liner that conditionally defines `Symbol.observable = Symbol.for('observable')`. Trivial to implement (~1 line), but relying on symbol-observable ensures cross-platform compatibility and follows the standard pattern.

### `[ ]` `clsx`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 3/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

Utility function for constructing conditional CSS class names in JavaScript.

Used in quidproquo-docusaurus/src/components/HomepageFeatures/index.tsx. Imported as 'import clsx from "clsx"' and used to conditionally apply CSS classes: clsx('col col--4'). This is a simple utility for building class name strings without string concatenation.

**Write our own?** Trivial. clsx is just a conditional string concatenator for classes. A one-liner replacement: const clsx = (...args) => args.filter(Boolean).join(' '). We use only the basic functionality without any of its advanced features.

### `[ ]` `upath`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 3/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-awscdk`

Cross-platform path normalization utility that converts Windows backslashes to Unix-style forward slashes.

Used throughout quidproquo-deploy-awscdk to normalize file paths for cross-platform compatibility. Imported in five files: getWebEntryFullPath.ts, getStorageDriveUploadFullPath.ts, getApiBuildPathFullPath.ts, getRedirectApiBuildFullPath.ts, and Function.ts. All imports use the 'join' function from upath to join path segments (e.g., 'join(qpqCoreUtils.getConfigRoot(qpqConfig), webEntryQPQWebServerConfigSetting.buildPath)' and 'join(qpqAwsCdkPathUtils.getApiBuildPathFullPath(props.qpqConfig), props.functionType)').

**Write our own?** Trivial - upath's join() is a thin wrapper around the built-in path.join() with forward-slash normalization. We could replace all upath.join() calls with path.join().replace(/\\/g, '/') or use path.posix.join() in a few lines per file.

### `[ ]` `chalk`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 5/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

Terminal string styling library for colorized console output.

Used in two log action processors (getLogTemplateLiteralActionProcessor.ts and getLogCreateActionProcessor.ts) to color-code console output. Specifically uses: chalk.yellowBright(), chalk.white(), chalk.bgRed.white.bold, chalk.red.bold, chalk.yellow, chalk.cyan, chalk.green, and chalk.gray for different log levels (Fatal, Error, Warn, Info, Debug, Trace).

**Write our own?** Trivial — we just need string templates with ANSI escape codes. A simple map of log level to ANSI codes would replace all our usage in ~20 lines.

### `[ ]` `d3`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 5/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A JavaScript library for data visualization with tools for DOM manipulation, scales, axes, and SVG rendering.

The package is listed as a direct dependency in quidproquo-web-admin/package.json (v7.8.4) but is never imported or used anywhere in the application source code. It appears to be an unused/leftover dependency. The react-d3-tree package (which IS actively used) imports individual D3 submodules like d3-hierarchy, d3-selection, d3-shape, and d3-zoom from its own node_modules, not from the main d3 bundle.

**Write our own?** This is impossible to assess because the code doesn't actually use d3. If it were used for specific visualization features, we would need to replace it with a custom D3 implementation or find lighter alternatives, but this would be considerable work.

### `[ ]` `undici`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 5/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

HTTP client library for Node.js that provides a modern, standards-compliant fetch implementation.

Listed as a dependency in federation-poc/app1/package.json but there is no actual usage in the codebase. No imports, requires, or references to undici functionality appear in any source files. Appears to be an unused dependency.

**Write our own?** If it were actually used, we could replace it with Node's built-in http/https modules or the native fetch API (available in Node 18+), which is what the repo likely targets based on quidproquo-docusaurus's engines.node requirement.

### `[ ]` `globals`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 8/100 &nbsp;·&nbsp; **Used in:** `quidproquo-eslint-config`

A package providing comprehensive mappings of global variables available in different JavaScript environments (browser, Node.js, web workers, etc).

In quidproquo-eslint-config/eslint.config.mjs (lines 2 and 11), globals is imported and used to populate the languageOptions.globals config. Specifically, it spreads both globals.browser and globals.node into the global namespace so eslint doesn't flag built-in globals like 'window', 'document', 'process', '__dirname' as undefined. The globals.json file contains ~200+ environment-specific global definitions.

**Write our own?** Easy. We only use globals.browser and globals.node, which is essentially a static JSON map of ~100 globals per environment. Could be maintained as a simple JSON file in our own config. Approximately 50 lines of JSON.

### `[ ]` `tsx`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 8/100 &nbsp;·&nbsp; **Used in:** `quidproquo`

TypeScript runtime that executes .ts files directly without compilation.

Used in the root package.json to run the patch script: `npm run patch` invokes `npx tsx ./scripts/applyPatch.ts`. The applyPatch.ts script is a build-time utility that reads and updates all workspace package.json files to synchronize version numbers after a patch bump. It uses Node's fs and path modules to read package.jsons, extract workspace version info, and write updated versions back to disk.

**Write our own?** Trivial — tsx just needs to parse TS and run it via Node. You could write a wrapper using esbuild/swc to compile then run, 50-100 lines of code.

### `[ ]` `uuid`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 8/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-web`

A UUID (Universally Unique Identifier) generator library, specifically the v4 random UUID implementation.

Imported as `v4 as uuidV4` in quidproquo-actionprocessor-js/src/actionProcessor/core/guid/getGuidNewActionProcessor.ts. Used to generate RFC 4122 v4 random UUIDs when the GuidActionType.New action is triggered. Returns the UUID string as the action result.

**Write our own?** Generating a v4 UUID requires understanding the UUID spec, implementing cryptographic randomness, formatting the output correctly with hyphens and version bits. Could be done in ~50 lines but crypto.randomUUID() in Node.js 15+ makes this trivial (~2 lines using native APIs).

### `[ ]` `@mui/lab`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 10/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

MUI laboratory/experimental components library providing advanced or less common UI components that haven't graduated to main Material-UI.

Listed as a dependency in quidproquo-web-admin package.json (version ^5.0.0-alpha.128) but NOT directly imported or used anywhere in the codebase (zero grep matches for @mui/lab imports across all src files). It appears to be a transitive dependency required by other MUI packages or included for future use.

**Write our own?** Since there are no actual usages, this is effectively unused. If it were used, individual components from the lab would need to be extracted/reimplemented (TabContext, TreeItem, Timeline, LoadingButton, etc.), which would vary in complexity from 5-20 hours per component.

### `[ ]` `sqlite`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 12/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

Promise wrapper around sqlite3 native driver.

In SqliteKvsRepository.ts, sqlite wraps sqlite3.Database. Used via sqlite.open({ filename, driver: sqlite3.Database }) to get a promisified connection. Used for .exec() (PRAGMA statements), .get() (single row queries), .all() (multiple rows), .run() (INSERT/UPDATE/DELETE), and .close().

**Write our own?** Easy — promisifying sqlite3 callbacks is straightforward (10-30 lines). The real complexity is in the SqliteKvsRepository's query building and schema management, not the sqlite wrapper itself.

### `[ ]` `concurrently`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 15/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

CLI tool that runs multiple npm scripts in parallel with colored output and proper signal handling.

Used in federation-poc/package.json only. The 'demo' script runs 'concurrently "npm run start:app1" "npm run start:app2"' to launch two Node.js servers simultaneously for the module federation demonstration. No other usage across the monorepo.

**Write our own?** Easy. Concurrently is just a process orchestrator. We could replace it with a simple Node.js script using child_process.spawn() or use npm's built-in 'npm-run-all' package. The complexity is only in managing exit codes and signal propagation.

### `[ ]` `react-time-ago`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 15/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A React component library that wraps javascript-time-ago to provide relative date/time formatting as React components.

react-time-ago is imported in LastSeen.tsx as ReactTimeAgo and used directly as a component: <ReactTimeAgo date={date} locale="en-US" />. It takes a Date object and locale string, rendering it as a relative time string (e.g., '2 hours ago'). LastSeen is a memoized wrapper exported from the components module and used throughout the LogViewer for displaying relative timestamps.

**Write our own?** Easy - react-time-ago is a thin wrapper around javascript-time-ago. We could simply create our own LastSeen component using javascript-time-ago directly or write a simple relative date formatter and wrap it as a React component in a few lines.


## Tier 2 — Easy to moderate

_Bounded scope. A day or so of work each to replace the slice we actually rely on._

### `[ ]` `react-markdown`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 20/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A React component that renders Markdown strings into React elements.

Used in quidproquo-web-admin/src/LogViewer/HelpChat/HelpChat.tsx (line 123) to render AI assistant chat messages with markdown formatting. Single instantiation: <Markdown>{message.message}</Markdown> where message.message contains markdown text from an API response. No custom plugins, remark transformations, or rehype processors—just basic markdown-to-HTML rendering.

**Write our own?** Easy-to-moderate. A basic markdown parser (using a library like marked or showdown) and wrapping the output in React.ReactNode is ~4–6 hours. Full feature parity with remark/rehype ecosystem would take longer, but we only render simple markdown (bold, italic, lists, code blocks).

### `[ ]` `tsconfig-paths`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 20/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A package that resolves TypeScript path mappings (tsconfig.json paths/alias) at runtime in Node.js.

Listed in quidproquo-web-admin devDependencies, but there is no import or require of tsconfig-paths in any source files. No register() call found. TypeScript path resolution is handled by tsc at compile time via tsconfig inheritance. The package appears to be an unused dependency.

**Write our own?** A runtime path resolution utility. If needed, this could be replaced by manual path mapping logic, though tsconfig-paths is lightweight and standard.

### `[ ]` `node-cache`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 22/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Simple in-memory caching utility with TTL (time-to-live) support.

Node-cache powers memoization in memoFunc.ts and memoFuncAsync.ts. These wrappers create a NodeCache instance per function with configurable TTL (default 3600 seconds), serialize function arguments to JSON as cache keys, and return cached results on hits. Used to memoize expensive operations: getSecret (AWS Secrets Manager lookups, 60s TTL), getParameter/getParameters (SSM Parameter Store, default TTL), getExportedValue (CloudFormation exports, default TTL), and calculateSecretHash (Cognito HMAC computation, default TTL). Reduces AWS API calls and improves Lambda performance.

**Write our own?** Easy to moderate. Basic in-memory cache with TTL is straightforward (Map + expiration timestamps), but edge cases include memory leaks with WeakMap usage, concurrent access patterns, and precise TTL expiration. We use a fairly simple subset (get/set/has/TTL).

### `[ ]` `html-webpack-plugin`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 25/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A webpack plugin that generates HTML files to serve bundled assets.

Listed in quidproquo-web-admin devDependencies. While quidproquo-web-admin does contain an index.html file in src/, it is not generated or used by html-webpack-plugin (webpack is not invoked). Not configured or used.

**Write our own?** A webpack plugin for HTML generation. Not used since webpack bundling is not part of the build pipeline.

### `[ ]` `uuidv7`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 25/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-web`

A UUID v7 generator producing sortable, time-based UUIDs as defined in draft RFC 4122bis.

Imported as `{ uuidv7 }` in quidproquo-actionprocessor-js/src/actionProcessor/core/guid/getGuidNewSortableActionProcessor.ts. Used to generate sortable UUIDs when the GuidActionType.NewSortable action is triggered—these UUIDs have millisecond-precision timestamps embedded and sort chronologically, making them useful for database keys and log ordering.

**Write our own?** UUID v7 is a relatively new spec with complex bit-packing requirements (timestamp, random bytes, version/variant fields). Generating it would require carefully implementing timestamp extraction and encoding. Could be done in ~100 lines but would need RFC 4122bis reference material (~half day).

### `[ ]` `javascript-time-ago`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 28/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A library that provides localized relative date/time formatting (e.g., '2 hours ago', 'last week').

javascript-time-ago is used in LastSeen.tsx to initialize a TimeAgo formatter with English locale (importing both the library and en.json locale file). It is instantiated with TimeAgo.addDefaultLocale(en) and passed to the ReactTimeAgo component. LastSeen is rendered in DateCell (used in LogMetadataGrid and AdminLogGrid) to display relative timestamps alongside absolute datetime.

**Write our own?** Moderate difficulty - we use only the basic feature (formatting timestamps as relative text in English). Writing a simple relative date formatter supporting 'hours ago', 'days ago' patterns would take a few hours, but handling edge cases and multiple languages would require more effort.

### `[ ]` `jotai`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 28/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-react`

A minimal and extensible state management library for React with Jotai atoms.

quidproquo-web-react uses jotai to implement its runtime state management system. Specifically, in /quidproquo-web-react/src/hooks/asmj/createQpqRuntimeDefinition.ts, the library creates jotai atoms via atom() to store application state, uses useAtom() hook to read/write state in React components, and selectAtom() from jotai/utils to create derived/computed state selectors. The createQpqRuntimeDefinition function creates named atoms indexed in a Map, and useQpqRuntimeState and useQpqRuntimeComputed provide React hooks that wrap jotai's useAtom for integration with the framework's reducer-based runtime system. This is the foundational state management layer used by useQpqRuntime and useQpqWebsocketQueueRuntime hooks in quidproquo-web-react.

**Write our own?** We would need to build a custom React context/hook-based state management system with support for derived atoms and memoization. This is achievable (~2-3 days) but requires careful handling of React render optimization and subscription management.

### `[ ]` `node-match-path`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 31/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Matches URL paths against parameterized route patterns and extracts path parameters.

Used in awsLambdaUtils.ts for matchUrl(), which converts route patterns from AWS CloudFormation notation ({paramName}) to Express-style notation (:paramName), then calls match() to test if a URL matches the pattern and extract parameters. Called during event matching in API Gateway (matching request paths to route handlers), CloudFront origin requests, and SQS queue type matching. Returns an object with didMatch boolean and optional params dictionary.

**Write our own?** Moderate. Path matching is essentially regex construction for parameterized patterns (parsing curly braces, extracting param names, building regex with capture groups, extracting matches). The regex escaping and parameter extraction require care to handle special characters and multiple parameters.

### `[ ]` `@anthropic-ai/sdk`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 35/100 &nbsp;·&nbsp; **Used in:** `quidproquo-core`, `quidproquo-webserver`, `quidproquo-neo4j`, `quidproquo-actionprocessor-js`

Official TypeScript SDK for the Anthropic Claude API, providing client libraries for calling Claude models.

The quidproquo repo uses the SDK in two main ways:

1) In quidproquo-core and quidproquo-actionprocessor-js: Instantiates an Anthropic client with `new Anthropic({ apiKey })` and calls `anthropic.messages.create(body)` with Anthropic.Messages.MessageCreateParamsNonStreaming parameters to execute direct Messages API calls. The SDK types are used to define action payloads (ClaudeAiMessagesApiActionPayload uses `Anthropic.Messages.MessageCreateParamsNonStreaming`) and catch AuthenticationError exceptions.

2) In quidproquo-webserver: Constructs detailed multi-part Anthropic message content with text blocks (type: 'text') and system prompts, calling the same messages.create() API to send Claude requests in the log chat message service.

quidproquo-neo4j declares the dependency in package.json but does not actually import or use it in any source files.

**Write our own?** Implementing a direct HTTP client wrapper for the Messages API would require handling API authentication, request/response serialization, error handling with typed exceptions, and maintenance as Claude model versions and parameters evolve. Moderate effort (~1-2 weeks) for a basic wrapper covering just the features we use.

### `[ ]` `chokidar`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 35/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

File watcher library that detects filesystem changes (create, delete, modify).

In fileWatcherImplementation.ts, chokidar.watch() monitors a storage directory path with configuration for stabilityThreshold, pollInterval, and ignore patterns. Events are bound to 'add', 'unlink', and 'error' handlers to trigger storage drive event handlers in quidproquo services.

**Write our own?** Moderate-to-hard — fs.watch exists in Node.js but is platform-inconsistent. Chokidar normalizes behavior across macOS/Linux/Windows and handles debouncing (awaitWriteFinish). We'd need to wrap fs.watch carefully and test cross-platform.

### `[ ]` `eslint-plugin-simple-import-sort`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 35/100 &nbsp;·&nbsp; **Used in:** `quidproquo-eslint-config`

An ESLint plugin that automatically sorts and validates import/export statement ordering with customizable grouping rules.

In quidproquo-eslint-config/eslint.config.mjs (lines 1, 17, 20-51), simple-import-sort is registered as a plugin and configured with two rules: 'simple-import-sort/imports' and 'simple-import-sort/exports'. The imports rule groups imports into four categories (quidproquo packages, external packages/react, aliases/relatives, and side-effects) with specific regex patterns. This enforces consistent import ordering across all quidproquo workspaces.

**Write our own?** Moderate. The core logic is regex-based grouping and sorting of import statements, which is bounded. However, handling edge cases (side-effect imports, type-only imports, require() vs import, circular dependencies) and making it autofixable would take 2-3 weeks.

### `[ ]` `react-router-dom`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 35/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Declarative routing library for React single-page applications.

react-router-dom is used minimally in quidproquo-web-admin: (1) BrowserRouter (aliased as Router) wraps the entire App component in App.tsx as the root navigation provider, (2) useSearchParams() hook is called in useLogLogMananagement.ts and useLogManagement.ts to read/write URL query parameters (specifically the 'correlation' param) for persisting selected log state. This is basic browser history and query string state management.

**Write our own?** Moderate difficulty. You'd need to implement browser history API integration, URL parsing, and search params serialization/deserialization. A simple useSearchParams() replacement is ~2–3 days; a full Router replacement ~1–2 weeks. The current usage is shallow (no nested routes, no dynamic segments).


## Tier 3 — Moderate to hard

_Real components with non-trivial edge cases. Replaceable, but it's genuine engineering — weigh it against the dependency cost._

### `[ ]` `busboy`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 38/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Streaming multipart form-data parser for Node.js.

Busboy is used exclusively in parseMultipartFormData.ts to parse multipart/form-data requests from API Gateway events. The code creates a Busboy instance with the request's content-type header, then streams file and field data through event handlers ('file', 'field', 'error', 'finish'), accumulating file buffers and field values before converting files to base64-encoded QPQBinaryData objects. This is the core mechanism for handling file uploads in Lambda API Gateway handlers.

**Write our own?** Medium difficulty. Would need to implement multipart boundary parsing, chunk handling, header parsing, and form field/file separation. This is specialized low-level streaming parsing with edge cases (encoded filenames, nested boundaries, large files), though the actual API surface we use is relatively simple.

### `[ ]` `@module-federation/node`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 45/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

Runtime plugin for Module Federation that enables federated modules to work in Node.js environments.

Used in federation-poc (experimental POC, not shipping framework). In federation-poc/app1 and federation-poc/app2, the package is integrated via webpack config using require.resolve('@module-federation/node/runtimePlugin') to load the runtime plugin. In app1/src/index.ts, the runtime plugin is explicitly imported and registered with registerPlugins() to enable module federation between Node.js applications running on different ports (3001 and 3002). The custom nodeFSFetchPlugin hooks into the 'afterResolve' lifecycle to redirect remote module loading from HTTP to local filesystem when loading app2's remoteEntry.

**Write our own?** Moderate difficulty. We'd need to replicate the webpack runtime plugin system for module federation in Node.js, including lifecycle hooks for resolving and loading remote modules. The filesystem-based fetch interceptor adds some complexity.

### `[ ]` `react-inspector`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 45/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A React component for displaying complex JavaScript objects as interactive, collapsible tree structures.

Used in quidproquo-web-admin/src/LogViewer/ConsoleLogViewer.tsx to render individual console log arguments as an inspectable tree. Single usage at line 26: <ObjectInspector data={arg} /> inside a map over log arguments. Used to display arbitrary JS objects (nested objects, arrays, primitives) in a human-readable, expandable tree UI, mimicking browser devtools object inspector.

**Write our own?** Moderate-to-hard. Building a tree renderer for arbitrary JS objects requires handling circular references, Symbol keys, deep nesting, and lazy rendering for performance. A basic version (without fancy features) is ~1–2 weeks. Devtools-level polish (syntax highlighting, value preview, getters) would take significantly longer.

### `[ ]` `prism-react-renderer`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 50/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

React component library for rendering syntax-highlighted code blocks using the Prism.js syntax highlighter.

Used in quidproquo-docusaurus. In docusaurus.config.ts, prism-react-renderer is imported to access pre-built Prism themes: 'import {themes as prismThemes} from "prism-react-renderer"' and used in themeConfig to set light and dark themes (prismThemes.github and prismThemes.dracula). Docusaurus uses this internally for syntax highlighting in code blocks across the documentation.

**Write our own?** Moderate-to-Hard. Syntax highlighting requires language grammars and tokenization logic. We could use highlight.js or Shiki as lighter alternatives, or build on Prism directly, but full implementation of all language support is substantial work.

### `[ ]` `ai`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 52/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Vercel AI SDK — a unified abstraction layer for building AI-powered applications, providing model-agnostic functions like generateText and streamText that work with any provider backend.

In quidproquo-actionprocessor-awslambda, the Vercel AI SDK is used to provide unified text generation and streaming interfaces that abstract over the underlying AWS Bedrock provider. Specifically:

1) generateText() is called in getAiPromptActionProcessor.ts with model, system, messages/prompt, tools, and stopWhen(stepCountIs(10)) parameters to generate non-streamed completions.

2) streamText() is called in getAiPromptStreamActionProcessor.ts with the same parameters to provide streaming completions, with error handling via the onError callback.

3) jsonSchema() from 'ai' is used in prepareAiPromptCall.ts to convert tool input schema definitions into SDK-compatible JSON schema format for tool definitions.

4) Type imports (TextStreamPart, ToolSet, ModelMessage types) are used to type-annotate stream parts and message conversion in toSdkMessages.ts, mapping internal AiMessage types to SDK ModelMessage types.

**Write our own?** Rolling our own text generation and streaming abstraction for AWS Bedrock would require implementing request marshalling, stream handling, error recovery, tool calling, and step-count-based stopping logic. This is substantial infrastructure (~2-3 weeks) as we'd need to handle streaming callbacks, type-safe tool definitions, and multiple message formats.

### `[ ]` `jsonwebtoken`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 52/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Signs and verifies JSON Web Tokens (JWTs).

Used in decodeValidJwt.ts for JWT validation in Cognito-based authentication. The code calls decode() with { complete: true } to extract the token header (including the key ID), then calls verify() with RS256 algorithm to cryptographically verify the signature against a public key from JWKS, with configurable expiration handling. This protects authenticated API requests and user authentication flows.

**Write our own?** Difficult. JWT signature verification requires proper cryptographic implementation with RS256 (RSA-SHA256), handling of key formats, algorithm validation, and expiration logic. Edge cases include key rotation, algorithm confusion attacks, and format validation.

### `[ ]` `multer`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 52/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

Express middleware for parsing multipart/form-data uploads.

Used in two places: (1) apiImplementation.ts uses app.use(multer().any()) to parse multipart uploads with default disk storage, (2) fileStorageImplementation.ts uses multer({ storage: multer.memoryStorage() }) for legacy POST-based file uploads to in-memory buffers via req.file.

**Write our own?** Hard — multipart form-data parsing is a complex spec with boundary detection, streaming chunks, nested field parsing, and file handling. Would require substantial Node.js stream plumbing and RFC 2388 compliance.

### `[ ]` `recharts`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 52/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A composable React charting library built on D3 that provides pre-built chart components (Bar, Line, Pie) with legends, tooltips, and axes.

Used in three chart components in the LogViewer dashboard: ErrorsByType.tsx (BarChart with Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend), ErrorsOverTime.tsx (LineChart with Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend), and RequestsByService.tsx (LineChart with dynamically generated Line series per service, XAxis, YAxis, CartesianGrid, Tooltip, Legend). Data is prepared by hooks (useErrorsByType, useErrorsOverTime, useRequestsByService) and passed directly to recharts components. The library handles all rendering, interactivity, and styling.

**Write our own?** Hard to very hard—would require building custom SVG-based chart components with axes, legends, tooltips, hover effects, and responsive sizing. While the actual data transformations are simple (bucketing, aggregation), recharts handles rendering complexity; a lighter alternative like a simple SVG-based charting library would be possible but requires significant effort for multi-line and stacked bar functionality.

### `[ ]` `date-fns`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 55/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Modern JavaScript date utility library providing functions for date manipulation and formatting.

date-fns is used indirectly through the MUI date picker adapter (@mui/x-date-pickers/AdapterDateFns) in three components: DateRangePicker.tsx, TopSection.tsx, and AdminLogSearchBar.tsx. These components import AdapterDateFns and pass it to the LocalizationProvider to enable date manipulation in DateTimePicker components. The library provides the underlying date parsing and manipulation for the MUI date pickers but is not imported directly in the application code.

**Write our own?** Difficult - date-fns is a comprehensive library with hundreds of utility functions. For the narrow use case of MUI's date picker adapter, we could potentially write our own adapter using native Date objects, but it would require understanding MUI's adapter interface and handling timezone/localization correctly.

### `[ ]` `immer`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 55/100 &nbsp;·&nbsp; **Used in:** `quidproquo-core`

A library for writing immutable state updates using a 'produce' function that allows mutations on a draft copy that are converted to immutable updates.

Imported as `{ produce } from 'immer'` in quidproquo-core/src/logic/stateEffects/buildMutableEffectReducer.ts. Wraps a reducer function that mutates a draft state. The `produce(state, handler)` call allows the handler to mutate the draft state via direct assignment while immer tracks changes and returns a new immutable state object. Used to enable convenient imperative state mutations in the QPQ effect reducer pattern while maintaining immutability semantics.

**Write our own?** Immer's produce function is a sophisticated proxy-based system that tracks property writes and deletions to efficiently compute diffs and create structural sharing. Building a comparable replacement would require deep knowledge of JavaScript proxies, immer's diffing algorithm, and handling edge cases (nested objects, arrays, circular refs). Would require 3-5 days of careful implementation.

### `[ ]` `jwks-rsa`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 58/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-awslambda`

Fetches and caches public keys from a JWKS (JSON Web Key Set) endpoint for JWT verification.

Used in decodeValidJwt.ts as a client to retrieve signing keys from AWS Cognito's JWKS endpoint (https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json). Calls jwksClient() to create a client, then client.getSigningKey(kid) to retrieve the key matching the token's 'kid' header, and getPublicKey() to extract the public key for verification. This enables stateless JWT validation without managing Cognito keys directly.

**Write our own?** Hard. Requires HTTPS fetching from JWKS endpoints, JSON parsing, key format handling (JWK to PEM conversion), caching/expiration logic, and error handling for network failures or malformed keys. Cognito's key rotation would require implementing refresh logic.

### `[ ]` `prettier`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 58/100 &nbsp;·&nbsp; **Used in:** `quidproquo-core`, `quidproquo-webserver`, `quidproquo-config-aws`, `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-awslambda`, `quidproquo-neo4j`, `quidproquo-deploy-webpack`, `quidproquo-deploy-awscdk`, `quidproquo-web`, `quidproquo-actionprocessor-web`, `quidproquo-web-react`, `quidproquo-web-admin`, `quidproquo-testing`, `quidproquo-dev-server`, `quidproquo-xstate`, `quidproquo-actionprocessor-node`

Code formatter for JavaScript, TypeScript, JSON, CSS, and Markdown.

Every workspace uses prettier via `npm run format` script that runs `prettier --write` on **/*.{js,jsx,ts,tsx,json,css,scss,md} files. Root .prettierrc configures formatting preferences: trailing commas, single quotes, arrow parens, print width 150, bracket spacing, prose wrap. Used as part of development workflow to enforce consistent code style across the monorepo.

**Write our own?** Hard — would need to implement parsers for multiple languages (TS, JSON, CSS, Markdown) and format ASTs intelligently with configuration options. 1-2 weeks.

### `[ ]` `@mdx-js/react`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 60/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

React provider and components for rendering MDX (Markdown with embedded JSX) in React applications.

Used in quidproquo-docusaurus (documentation site). The package is included as a dependency to support MDX syntax in documentation files (e.g., blog/2021-08-01-mdx-blog-post.mdx which contains JSX like '<button onClick={() => alert("button clicked!")}>Click me!</button>'). Docusaurus automatically processes MDX files and the @mdx-js/react provider enables React component rendering within markdown content.

**Write our own?** Hard. MDX requires parsing markdown with embedded JSX, maintaining source positions, and rendering to React. We'd need a markdown parser (remark), JSX compiler, and React binding layer. Could use existing libraries like remark + remark-mdx, but full MDX support is complex.

### `[ ]` `@vitest/coverage-v8`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 62/100 &nbsp;·&nbsp; **Used in:** `quidproquo`

Code coverage reporter plugin for vitest using V8 coverage.

Configured in root vitest.config.ts under the test.coverage object to generate coverage reports. Root package.json has script `test:coverage` that runs `vitest run --coverage`. Reports are saved to .coverage directory with multiple formats: text, html, json. Excludes node_modules, dist, lib, config files, tests, and scripts from coverage; includes src/**/*.ts and src/**/*.tsx files.

**Write our own?** Hard — would need to integrate with V8 coverage API, generate HTML/JSON reports, handle source maps, and format output. 2-3 days of work.

### `[ ]` `@mui/x-date-pickers`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 65/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Advanced date and time picker components with multiple picker types, localization, and adapter system.

Used in 3 files for date/time selection: DateRangePicker.tsx (DateTimePicker, LocalizationProvider with AdapterDateFns for date-fns integration), TopSection.tsx (DateTimePicker with AdapterDateFns), AdminLogSearchBar.tsx (DateTimePicker with AdapterDateFns). The LocalizationProvider wraps components with AdapterDateFns to enable date-fns library integration, allowing JavaScript Date objects to be used with the pickers.

**Write our own?** Building a full-featured date/time picker with locale support, multiple input formats, keyboard navigation, and integration with date-fns would take 40-60 hours. The date parsing and formatting logic alone is complex.

### `[ ]` `axios`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 65/100 &nbsp;·&nbsp; **Used in:** `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-web`

A promise-based HTTP client library for making network requests with support for request/response interception.

Used in quidproquo-actionprocessor-js/src/actionProcessor/core/network/getNetworkRequestActionProcessor.ts to implement the NetworkActionType.Request action processor. Creates an axios instance with a 25-second timeout and custom Accept-Encoding header. Handles HTTP methods (GET, POST, DELETE, HEAD, OPTIONS, PUT, PATCH) by wrapping axios calls to convert response types (binary as arraybuffer, text, or json) and transform binary responses into a custom QPQBinaryData format with base64 encoding, MIME type, and filename extraction from content-disposition headers.

**Write our own?** Replacing axios would require building a custom HTTP client from scratch—handling request/response formatting, multiple HTTP methods, content-type negotiation, error handling, timeouts, and binary response transformation. Would take 2-3 days.


## Tier 4 — Hard (substantial effort)

_Large surface area; a faithful replacement is effectively its own mini-project._

### `[ ]` `ws`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 68/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

WebSocket server library for Node.js.

In webSocketImplementation.ts, used for RawData, WebSocket, and WebSocketServer imports. Creates a WebSocketServer({ noServer: true }), binds to 'connection', 'message', 'error', and 'close' events, reads/writes via ws.send(JSON.stringify(payload)). Supports multiple concurrent connections indexed by connectionId.

**Write our own?** Very hard — WebSocket framing, opcode handling, masking, compression, and multi-client broadcast require RFC 6455 compliance. Node.js has no built-in WebSocket server; would need to wrap raw HTTP upgrades and handle protocol state.

### `[ ]` `@emotion/styled`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 70/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Emotion's styled component API for creating styled React components using template literals, similar to styled-components.

Not directly imported in any source files (zero grep matches), but is a transitive dependency of @mui/material. Emotion/styled powers MUI's styled engine used internally by @mui/material components. When MUI components render (Button, TextField, Box, etc.), they use emotion/styled internally for component styling and theming integration. The library itself is not called explicitly in application code but is required by MUI's component implementations.

**Write our own?** Emotion/styled provides styled component syntax, CSS-in-JS transformation, and theming context. Replacing it would require implementing template literal parsing, style object generation, and React component wrapping. This is similarly foundational to emotion/react; estimating 35-50 hours of work.

### `[ ]` `@eslint/js`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 70/100 &nbsp;·&nbsp; **Used in:** `quidproquo-eslint-config`

ESLint's official JavaScript language implementation providing recommended and all rule configurations for JavaScript linting.

In quidproquo-eslint-config/eslint.config.mjs (line 4 and 12), @eslint/js is imported as pluginJs and its configs.recommended preset is spread into the default export. This provides the baseline JavaScript linting rules for the organization. The recommended config includes widely-accepted rules like no-unused-vars, no-undef, prefer-const, etc.

**Write our own?** Very hard. This is ESLint's core JavaScript rule set (100+ rules with subtly different behaviors across JavaScript versions and edge cases). We could manually list rules, but validating correctness would require extensive testing.

### `[ ]` `react-d3-tree`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 70/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A React component library that provides interactive hierarchical tree visualization using D3 for rendering and layout calculations.

Used in /quidproquo-web-admin/src/LogViewer/LogCorrelationTree.tsx to visualize execution traces as an interactive tree. The component renders the Tree component with custom SVG nodes (circles and rectangles) and custom text rendering for log correlation metadata. It also uses TreeNodeDatum type from react-d3-tree in useLogTreeData.ts hook for type checking tree data structure passed from API responses.

**Write our own?** Very hard—would require reimplementing D3's tree layout algorithm, SVG transformation, zoom/pan interactions, and animation logic. D3's hierarchical layout calculations are complex and well-tested; we'd need to port similar algorithms.

### `[ ]` `@emotion/react`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 72/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

CSS-in-JS library providing emotion's core functionality for writing CSS in JavaScript with built-in support for React component styling.

Not directly imported in any source files (zero grep matches), but is a peer dependency of @mui/material and @emotion/styled. Emotion powers MUI's sx prop styling system which is heavily used throughout the codebase (79 occurrences of sx={...} in component files). When MUI components with sx props render (e.g., Box sx={{ display: 'flex', ... }} in MainLayout.tsx and Login.tsx), Emotion's runtime CSS injection handles the style application. Emotion is the underlying CSS-in-JS engine that MUI v5+ depends on for its styling solution.

**Write our own?** Emotion provides CSS-in-JS parsing, runtime style injection, and React integration. Replacing it would mean implementing a CSS parsing layer, dynamic style sheet injection, and Babel plugin support. This is a foundational library; building an equivalent would be 40-60 hours of work plus ongoing maintenance.

### `[ ]` `webpack-virtual-modules`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 72/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`

Webpack plugin that allows creating virtual (in-memory) modules that don't exist on disk.

Used in quidproquo-deploy-webpack's QpqPlugin (src/plugins/QpqPlugin.ts) to dynamically generate and inject a virtual module 'quidproquo-dynamic-loader.js' into webpack's module resolution. The plugin instantiates VirtualModulesPlugin with a key-value object where the key is the resolved path to the virtual module and the value is the generated source code from getQpqDyanmicLoaderSrcFromQpqConfigs(). This loader exports qpqConfig, qpqConfigs, qpqDynamicModuleLoader, and qpqDynamicModuleLoaderForService functions that enable dynamic loading of service modules at runtime.

**Write our own?** Very hard - this would require deep webpack plugin API knowledge and custom compilation hooks to inject modules into webpack's compilation pipeline. You'd need to understand webpack's module graph, asset generation, and compilation lifecycle.

### `[ ]` `@mui/icons-material`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 75/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Icon library providing 5000+ Material Design icons as React components.

Used to import specific Material Design icons throughout quidproquo-web-admin: Lock (Login.tsx, auth challenge screens), BugReport/Extension/Restore/Settings/Terminal (useTabs.tsx for navigation icons), ExpandMore/ExpandLess (DateRangePicker.tsx for menu toggles), ContentCopy, History, Person, Android icons. Imported in 13 files across Auth, LogViewer, and component directories. Icons are rendered as JSX components inside BottomNavigationAction and other MUI components.

**Write our own?** Would need to create or integrate SVG icons, convert to React components, and manage 5000+ icon assets. Building the icon set alone would take weeks; licensing and maintaining consistent design would add more effort.

### `[ ]` `@mui/x-data-grid`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 75/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Advanced data table/grid component library with features like pagination, sorting, filtering, and customizable rendering.

Used in 6 files for displaying tabular log data. Key usage: DataGrid.tsx (wraps MuiDataGrid with custom column definitions), LogMetadataGrid.tsx (displays logs with DataGrid, custom pagination component DataGridPagination.tsx, row rendering), AdminLogGrid.tsx (displays admin logs with DataGrid, custom row styling via getRowClassName), DataGridPagination.tsx (uses gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector hooks for pagination control), and Config.tsx (imports useOnMount from @mui/x-data-grid/internals). Components rely on GridColDef, GridRenderCellParams, GridRowClassNameParams types for column definitions and custom rendering.

**Write our own?** Building a virtualized data grid with pagination, sorting, filtering, and API integration would be a substantial undertaking. This is essentially a complete component library on its own (80+ hours minimum).

### `[ ]` `@vitest/ui`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 78/100 &nbsp;·&nbsp; **Used in:** `quidproquo`

Web UI dashboard for vitest that displays test results in real-time.

Invoked via root package.json script: `test:ui` runs `vitest --ui`. Provides a visual interface to view test execution, failures, and timings. No custom configuration in vitest.config.ts files — uses @vitest/ui's defaults when --ui flag is passed.

**Write our own?** Very hard — would need to build a web dashboard with real-time test result streaming, WebSocket or SSE communication, result parsing, UI framework, and styling. 1-2 weeks of work.

### `[ ]` `xstate`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 78/100 &nbsp;·&nbsp; **Used in:** `quidproquo-xstate`

A JavaScript state machine and statechart library for modeling complex application state transitions.

quidproquo-xstate is a dedicated wrapper workspace around xstate. It uses createMachine() to build state machines from MachineConfig<MachineContext, EventObject> definitions, and createActor() to instantiate and manage machines. The library is used in three action processors: getStateMachineCreateActionProcessor creates initial machine instances and captures entry actions, getStateMachineSendEventActionProcessor transitions machines by sending events and tracking guard/action execution, and getStateMachineGetStateActionProcessor rehydrates persisted snapshots to query current state. XState snapshots (getPersistedSnapshot/getSnapshot) are persisted to a key-value store, enabling state machines to survive across requests. Machines are configured with custom actions and guards that map to QPQ story/runtime implementations.

**Write our own?** We would need to write a full state machine interpreter supporting hierarchical states, transitions, guards, actions, and snapshot persistence. This is a complex problem (~20+ days) requiring deep expertise in state machines, as xstate handles intricate edge cases around composite states, parallel states, and history.

### `[ ]` `ts-loader`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 80/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

Webpack loader that transpiles TypeScript to JavaScript during the build process.

Used in federation-poc (experimental POC, not shipping framework). In both federation-poc/app1 and federation-poc/app2, ts-loader is configured in webpack.config.js under module.rules to handle .ts and .tsx files, transpiling them to JavaScript. The loader excludes node_modules and is the only transpiler configured for the POC builds.

**Write our own?** Very hard. TypeScript compilation involves symbol resolution, type checking, and source map generation. We'd essentially need to reimplement large parts of the TypeScript compiler. Could use esbuild or swc as lighter alternatives, but writing from scratch is impractical.

### `[ ]` `@mui/material`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 85/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

Material Design component library for React providing pre-built UI components with Material Design styling and theming.

Used extensively across quidproquo-web-admin as the primary UI component library. Key usage sites include: App.tsx (ThemeProvider, CssBaseline), Config.tsx (Box, Drawer, List, TextField, Tabs, Toolbar), Auth components (Login.tsx, AuthChallenge*.tsx with Box, Grid, TextField, Typography), MainLayout.tsx (BottomNavigation, BottomNavigationAction, CircularProgress), and 46+ other component files. Components used include: Box, Button, TextField, Typography, Grid, Dialog, Tabs, Table, MenuItem, IconButton, Autocomplete, Pagination, CircularProgress, Alert, Checkbox, Paper, and more. The sx prop is used in 79 locations for inline styling (e.g., MainLayout.tsx line 38-46 with display/flexDirection/position/zIndex styling).

**Write our own?** Would require building a complete design system with 30+ components, consistent theming/styling system with sx prop support, Material Design tokens, and responsive utilities. Achievable but significant 2-3 month effort.

### `[ ]` `vitest`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 85/100 &nbsp;·&nbsp; **Used in:** `quidproquo`, `quidproquo-testing`

JavaScript test runner and assertion library built on Vite.

Vitest is the test framework for the entire monorepo. Root package.json defines scripts: `test` runs `vitest run`, `test:watch` runs `vitest`, and `test:ui` runs `vitest --ui`. The root vitest.config.ts uses `defineConfig` from 'vitest/config' to configure test projects across all workspaces, coverage reporting (text, html, json), and exclusions. Every workspace has a vitest.config.ts (e.g., quidproquo-core/vitest.config.ts defines test globals and environment: 'node'). Test files import from vitest: `import { describe, expect, it } from 'vitest'` (seen in 16+ .test.ts files). quidproquo-testing provides vitest-specific exports and registers custom matchers for testing generators (toYieldValue, toCompleteWith, toYieldSequence) via vitestMatchers.ts.

**Write our own?** Very hard — would need to reimplement test runner with assertion library, CLI, reporter system, environment setup (jsdom/node), coverage integration, and watch mode. Realistically impractical.


## Tier 5 — Impractical (foundational infrastructure)

_Compilers, bundlers, UI frameworks, native bindings. You would switch tools, not reimplement these._

### `[ ]` `@babel/core`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

The core Babel transpiler that transforms JavaScript/TypeScript code.

Both packages list @babel/core as a devDependency, but it is not actively used in the build process. The actual build scripts in both packages use `tsc` (TypeScript compiler) to compile TypeScript to JavaScript rather than Babel. The Babel packages appear to be legacy dependencies retained in package.json but not invoked in the build pipeline (package.json shows build scripts are only `tsc -p tsconfig.*.json`).

**Write our own?** Babel is a mature, foundational transpiler with very complex AST transformation logic. Replacing it for any real use case would be impractical; however, in this repo's case it's not being used at all.

### `[ ]` `@babel/plugin-transform-react-jsx`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A Babel plugin that transforms modern React JSX syntax.

Listed in quidproquo-web-admin devDependencies, but JSX transformation is performed by TypeScript compiler (tsconfig.esm.json) using the 'react-jsx' setting rather than by this Babel plugin. Not invoked or configured.

**Write our own?** A Babel JSX transformation plugin. Not used in this repo since tsc handles JSX transformation.

### `[ ]` `@babel/preset-env`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

A Babel preset that automatically determines which JavaScript features need transpiling based on target environments.

Listed as devDependency in both packages, but there is no .babelrc, babel.config.js, or any Babel configuration file in the repo. Not invoked in any build scripts—build uses TypeScript compiler instead. No actual usage detected.

**Write our own?** This is a configuration helper for Babel. Since Babel isn't being used in the build pipeline, this preset has no actual function in the codebase.

### `[ ]` `@babel/preset-react`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A Babel preset that automatically configures Babel to handle React JSX syntax.

quidproquo-web-admin contains React/JSX components (e.g., /src/components/AdminDialog.tsx) that are transpiled via TypeScript compiler with 'jsx': 'react-jsx' (tsconfig.esm.json line 6), not via Babel/preset-react. This preset is not actually used.

**Write our own?** A Babel plugin set for JSX. Since TypeScript's compiler handles JSX transformation directly, this is unnecessary.

### `[ ]` `@babel/preset-typescript`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

A Babel preset that enables parsing and transpiling of TypeScript syntax.

Listed in devDependencies but not configured or invoked. TypeScript compilation is handled directly by tsc with jsconfig 'jsx': 'react-jsx' for JSX support (quidproquo-web-admin tsconfig.esm.json). Babel/preset-typescript is not active.

**Write our own?** A Babel configuration layer. Not applicable since Babel is not used for TypeScript compilation here.

### `[ ]` `babel-loader`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

A webpack loader that bridges webpack with Babel to transpile code during bundling.

Listed in devDependencies in both packages, but not configured in any webpack.config.js or .babelrc files in the repo. The quidproquo-deploy-webpack package defines webpack Configuration types but does not set up babel-loader in module.rules (getWebpackConfigForQpq.ts only shows YAML/JSON loaders). No active webpack bundling or Babel transpilation occurs in build scripts.

**Write our own?** A loader integration layer between webpack and Babel. Since neither webpack bundling nor Babel transpilation is active in the build pipeline, this has no actual use.

### `[ ]` `eslint`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-eslint-config`

A pluggable JavaScript linter that analyzes code using AST pattern matching to identify problematic patterns.

quidproquo-eslint-config imports eslint implicitly through its configuration files. The eslint.config.mjs file creates a flat config array that integrates eslint with other plugins (@eslint/js, typescript-eslint, eslint-plugin-simple-import-sort, and globals). While not explicitly imported in eslint.config.mjs, eslint is the runtime that processes these configurations and executes linting when developers or CI systems run eslint commands across all 18 quidproquo-* workspaces that inherit this shared config via import statements in their own eslint.config.mjs files.

**Write our own?** Impractical to reinvent. ESLint is a mature, large-scale AST-based pattern matching engine with hundreds of rules, plugin ecosystem integration, and widespread community support. Writing our own JavaScript linter would be a multi-person-year effort.

### `[ ]` `webpack-cli`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A command-line interface for running webpack bundler from the terminal.

Listed in quidproquo-web-admin devDependencies but never invoked in any build script. Build uses `tsc` instead. webpack-cli is unused in this codebase.

**Write our own?** A CLI wrapper around webpack. Not applicable since webpack is not invoked in the build pipeline.

### `[ ]` `webpack-dev-server`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 86/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A development server that serves webpack-bundled assets and provides hot-reload capabilities.

Listed in quidproquo-web-admin devDependencies but not referenced in any build scripts, webpack config, or source code. The repository includes quidproquo-dev-server as a separate workspace for development, not webpack-dev-server. No active use detected.

**Write our own?** A development server framework. Not used in this repo's build or dev setup.

### `[ ]` `@module-federation/enhanced`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 88/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`

A webpack-based module federation plugin that enables dynamic loading of remote modules at runtime and build-time federation configuration.

In quidproquo-web-admin, the package is used via its runtime API to dynamically load federated addons. The useFederatedAddon hook (quidproquo-web-admin/src/useFederatedAddon.ts) uses loadRemote() and registerRemotes() from '@module-federation/enhanced/runtime' to discover a federation manifest URL, register remote modules, and dynamically load React components as federated addons that are displayed as tabs in the admin UI (seen in useTabs.tsx). The federation-poc sample apps use the ModuleFederationPlugin for webpack build configuration to expose and consume modules across app1 and app2, with registerPlugins() for custom runtime middleware.

**Write our own?** Extremely difficult - would require building a complete module federation system with webpack plugin integration, runtime module loading, code splitting, and shared dependency resolution. This is a foundational infra component similar to webpack itself.

### `[ ]` `typescript-eslint`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 88/100 &nbsp;·&nbsp; **Used in:** `quidproquo-eslint-config`

The official tooling package that enables TypeScript support in ESLint, providing a TypeScript parser and comprehensive TypeScript-aware rules.

In quidproquo-eslint-config/eslint.config.mjs (lines 3 and 13), typescript-eslint is imported as tseslint and its configs.recommended preset is spread into the config array. This enables TypeScript parsing and applies recommended TypeScript-specific rules (@typescript-eslint/* rules). The overrides.mjs file then disables some strict TypeScript rules like no-explicit-any and no-unused-vars to match the project's development experience preferences.

**Write our own?** Impractical. TypeScript-ESLint requires integrating a TypeScript parser, understanding TypeScript's type system deeply, and implementing 50+ TypeScript-specific rules that depend on semantic analysis (type-aware linting). This is a multi-person-year effort equivalent to maintaining a TypeScript compiler plugin.

### `[ ]` `webpack`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 88/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-webpack`, `quidproquo-web-admin`

A module bundler that packages JavaScript/TypeScript code and assets for distribution.

quidproquo-deploy-webpack exports webpack Configuration types and custom plugins (QpqPlugin, QpqWebPlugin) that implement WebpackPluginInstance, Compiler, DefinePlugin interfaces from webpack. These plugins modify webpack compiler options (resolve.alias, DefinePlugin for process.env variables) and integrate webpack-virtual-modules. However, the actual build scripts use tsc, not webpack. The package is a peer dependency for consumers that would use webpack; the library exports reusable webpack configuration helpers but doesn't run webpack itself.

**Write our own?** Webpack is a foundational bundling/module system infrastructure—effectively impossible to replace. However, in this repo's context, it's used only for type definitions and configuration helpers, not for actual bundling.

### `[ ]` `@docusaurus/preset-classic`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 90/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

Default Docusaurus preset that bundles the classic theme, docs plugin, and blog plugin with sensible defaults.

Used in quidproquo-docusaurus. In docusaurus.config.ts, the preset is configured under presets array with options for docs routing (routeBasePath: '/'), sidebar configuration, and custom CSS. The preset orchestrates the theme, docs plugin, and generates the navbar/footer from themeConfig. Type imports from '@docusaurus/preset-classic' are used for config type safety (Preset.Options, Preset.ThemeConfig).

**Write our own?** Impractical. This preset is tightly integrated with Docusaurus core and includes the theme system, docs plugin plugin, layout components, and styling. Replacing it would require building an equivalent plugin system and theme layer.

### `[ ]` `esbuild`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 90/100 &nbsp;·&nbsp; **Used in:** `quidproquo-deploy-awscdk`, `quidproquo-actionprocessor-awslambda`

JavaScript/TypeScript bundler and minifier that compiles code to a single bundle.

Esbuild is used in quidproquo-actionprocessor-awslambda's build script (scripts/buildLogExtensionLayer.mjs) to bundle the Lambda log extension. The script calls esbuild.build() with entryPoints pointing to src/lambdaExtensions/qpqLogExtension/index.ts and bundles it into a single index.js file with all dependencies inlined. This compiled extension layer is then shipped in lib/extension-layer and consumed by quidproquo-deploy-awscdk's LambdaLayers construct via getLogExtensionLayerPath() to attach to Lambda functions. The build runs with target 'node22', format 'cjs', and minification enabled.

**Write our own?** Extremely difficult - esbuild is a sophisticated bundler handling module resolution, tree-shaking, minification, and cross-platform compilation. Writing a replacement would require understanding Node's module system, handling dozens of edge cases, and optimizing for performance.

### `[ ]` `@docusaurus/core`

**Category:** build &nbsp;·&nbsp; **DIY difficulty:** 95/100 &nbsp;·&nbsp; **Used in:** _not referenced by any workspace (POC / docs / transitive)_

Core framework that provides the static site generation engine, build system, and server for Docusaurus.

Used in quidproquo-docusaurus (documentation site, not the shipping framework). The package is invoked via CLI scripts in package.json (docusaurus start, docusaurus build, docusaurus deploy, etc.). Configuration is defined in docusaurus.config.ts which specifies site metadata, presets, theme config, and navbar/footer structure. The core handles rendering markdown/MDX docs with the preset-classic theme and building the static site output.

**Write our own?** Impractical. Docusaurus is a full-featured static site generator with markdown/MDX processing, theme system, versioning, search indexing, and deployment integration. Rewriting this from scratch would be a multi-month project equivalent to building Docusaurus itself.

### `[ ]` `jsdom`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 95/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`, `quidproquo-web-react`

JavaScript implementation of the DOM and web APIs for testing.

Configured in two workspace vitest configs: quidproquo-web-admin/vitest.config.ts and quidproquo-web-react/vitest.config.ts both set `environment: 'jsdom'` to enable DOM testing. This allows tests in React-based workspaces to run with a simulated DOM environment, making window, document, and other browser APIs available.

**Write our own?** Impractical — DOM implementation is massive (thousands of APIs, complex event model, layout simulation). Would take months to build a usable replacement.

### `[ ]` `react-dom`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 95/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`, `quidproquo-docusaurus`

The package that renders React components into the browser's DOM.

react-dom is installed as a dependency in quidproquo-web-admin (peer 18.3.1) and quidproquo-docusaurus (^19.0.0), but we don't directly import it in source code. It's required implicitly—webpack/build tooling handles the DOM rendering pipeline, converting JSX and component hierarchies into DOM mutations. Without it, no UI would render to the page.

**Write our own?** Not practical—React's reconciliation algorithm and DOM API surface are complex and version-locked to React itself. Any custom replacement would be a bespoke framework rewrite.

### `[ ]` `sqlite3`

**Category:** runtime &nbsp;·&nbsp; **DIY difficulty:** 95/100 &nbsp;·&nbsp; **Used in:** `quidproquo-dev-server`

Native SQLite driver for Node.js (C++ binding).

In SqliteKvsRepository.ts, sqlite3.Database is passed as the driver parameter to sqlite.open(). The native binary handles all SQL execution; we call nothing on sqlite3 directly, only through the sqlite promise wrapper.

**Write our own?** Impractical — sqlite3 is a native C++ extension to node-sqlite3. Writing a replacement would require compiling and shipping a native binary, managing platform-specific builds, and matching SQLite semantics.

### `[ ]` `react`

**Category:** react / ui &nbsp;·&nbsp; **DIY difficulty:** 100/100 &nbsp;·&nbsp; **Used in:** `quidproquo-web-admin`, `quidproquo-web-react`, `quidproquo-docusaurus`

The foundational JavaScript library for building user interfaces with components and hooks.

React is the core framework used throughout quidproquo-web-admin, powering all 73+ .tsx components and hooks (useState, useEffect, useRef, useMemo, memo, useContext) for state management, component composition, and lifecycle handling. In quidproquo-web-react it provides the foundation for custom React hooks and context providers (WebsocketProvider, ActionProcessorProvider, RefreshAuthTokensProvider). Docusaurus (quidproquo-docusaurus) uses React for the documentation site infrastructure. This is pervasive across the entire UI layer—nearly every component depends on React hooks and the React.FC type system.

**Write our own?** Completely infeasible. React's hook system, component lifecycle, virtual DOM reconciliation, and ecosystem integration are foundational. You would never replace this—you'd switch UI frameworks entirely.

### `[ ]` `typescript`

**Category:** dev / tooling &nbsp;·&nbsp; **DIY difficulty:** 100/100 &nbsp;·&nbsp; **Used in:** `quidproquo-core`, `quidproquo-webserver`, `quidproquo-config-aws`, `quidproquo-actionprocessor-js`, `quidproquo-actionprocessor-node`, `quidproquo-actionprocessor-awslambda`, `quidproquo-neo4j`, `quidproquo-deploy-webpack`, `quidproquo-deploy-awscdk`, `quidproquo-web`, `quidproquo-actionprocessor-web`, `quidproquo-web-react`, `quidproquo-web-admin`, `quidproquo-testing`, `quidproquo-dev-server`, `quidproquo-xstate`, `quidproquo-docusaurus`, `quidproquo-tsconfig`

TypeScript compiler and type checker for JavaScript.

TypeScript is the core language for the entire monorepo. All 18 workspaces depend on it as a devDependency to compile source files into JavaScript. Build scripts in every workspace invoke `tsc` with various tsconfig files (tsconfig.esm.json, tsconfig.commonjs.json) to produce compiled outputs in lib/esm and lib/commonjs directories. See quidproquo-core/package.json for typical usage: build scripts run `tsc -p tsconfig.commonjs.json` and `tsc -p tsconfig.esm.json`. The monorepo uses TypeScript 5.8.2.

**Write our own?** Impossible — the TypeScript compiler is a foundational tool. You would never reimplement it.
