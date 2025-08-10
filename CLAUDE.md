# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build Commands
```bash
# Build all packages
npm run build

# Build specific package
npm run build -w <package-name>

# Watch all packages (development)
npm run watch-all

# Watch specific package
npm run watch -w <package-name>

# Clean all build artifacts
npm run clean
```

### Code Quality
```bash
# Lint all packages
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format code
npm run format
```

### Publishing
```bash
# Version bump, build, and publish all packages
npm run go

# Publish all packages (after build)
npm run publish
```

### Development Server
```bash
# Run the development server
cd quidproquo-dev-server
npm run start
```

## Architecture Overview

Quidproquo is a functional, action-based web framework built on generators and pure functions. The architecture follows a Redux-like action/processor pattern where business logic is expressed as generator functions ("stories") that yield actions, which are then processed by platform-specific implementations.

### Core Concepts

1. **Actions**: Type-safe Redux-style actions with a type and optional payload. All actions are defined in `quidproquo-core/src/actions/`.

2. **Stories**: Generator functions that compose business logic by yielding actions and receiving results. Stories are pure functions that describe what should happen without knowing how.

3. **Action Processors**: Platform-specific implementations that execute actions. Each runtime (AWS Lambda, Node.js, browser) has its own set of processors in `quidproquo-actionprocessor-*` packages.

4. **Runtime**: The orchestration layer that executes stories by processing yielded actions through the appropriate processors.

### Package Architecture

The monorepo uses npm workspaces with these key relationships:

- **quidproquo-core**: Defines all action types and core abstractions. Every other package depends on this.

- **quidproquo-webserver**: Builds on core to add web-specific concepts like routes, APIs, and services.

- **quidproquo-actionprocessor-\***: Runtime implementations that execute actions. Each targets a specific platform (AWS Lambda, Node.js, browser).

- **quidproquo-config-aws** + **quidproquo-deploy-awscdk**: Work together to define and deploy AWS infrastructure using CDK.

- **quidproquo-web** + **quidproquo-web-react**: Client-side utilities and React integration for building SPAs that interact with QPQ backends.

### Action Categories

Actions are organized by domain in `quidproquo-core/src/actions/`:

- **Config**: Parameters, secrets, globals
- **KeyValueStore**: DynamoDB-like operations  
- **File**: S3-like file storage
- **UserDirectory**: Authentication and user management
- **EventBus**: Pub/sub messaging
- **Queue**: Message queuing
- **WebSocket**: Real-time connections
- **Graph**: Neo4j graph database operations
- **Claude**: AI integration
- **Network**: HTTP requests
- **System**: Platform utilities

### Adding New Features

1. **Define the action** in `quidproquo-core/src/actions/<domain>/`
2. **Create action requester** (generator function) in the same location
3. **Implement processors** in each `quidproquo-actionprocessor-*` package
4. **Export from index files** at each level

### TypeScript Configuration

All packages extend the base config at `quidproquo-tsconfig/tsconfig.base.json`. Packages build dual CommonJS/ESM outputs using separate tsconfig files.

### ESLint Configuration  

Shared ESLint config at `quidproquo-eslint-config/eslint.config.mjs` enforces consistent code style. Import sorting groups quidproquo packages separately from external dependencies.

## Important Notes

- This is a monorepo using npm workspaces - always use `-w <package-name>` to target specific packages
- No formal test framework is set up - testing is currently manual
- The project is under active development and not production-ready
- When modifying actions, ensure changes are reflected across all action processor implementations
- The dev server in `quidproquo-dev-server` is the primary way to test changes locally