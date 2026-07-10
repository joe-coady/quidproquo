---
sidebar_position: 1
---

# Getting Started

The fastest way to a running quidproquo app is one command:

```bash
npx create-qpq-app myapp
```

That scaffolds a complete, working application — five services, a local dev
server, and a one-image docker deploy — then installs its dependencies,
builds it, and makes the first git commit for you.

```bash
cd myapp
npm run go:dev     # local dev server on http://localhost:8080
```

Check it's alive:

```bash
curl http://localhost:8080/api/shell/v1/health
# {"status":"healthy","service":"shell","checkedAt":"..."}
```

## Prerequisites

- **Node.js 24 or newer** — the scaffolder checks and refuses politely on
  older versions
- **Docker** — only needed when you deploy (`npm run go`); local dev doesn't
  use it

## What you get

`create-qpq-app` generates an npm-workspaces monorepo:

```
myapp/
├── package.json              # workspace root — run all commands from here
└── apps/myapp/
    ├── deploy.config.json    # environments: development + production (docker)
    ├── packages/
    │   ├── constants/        # domain, service enum, user directory name
    │   ├── config/
    │   └── service-utils/    # the shared config every service starts from
    └── services/
        ├── shell/            # module-federation host — the root website
        ├── design/           # shared UI — federated views other services import
        ├── auth/             # authentication service
        ├── admin/            # the qpq admin console
        └── todo/             # the example feature: an api service + TodoList view
```

Every service follows the same layout: a `service/` package holding its
infrastructure config and controllers, an optional `views/` microfrontend,
and small lib packages (`models`, `shared-logic`, `service-utils`, …) for
code you'll share between them.

## Your first story

Business logic in quidproquo is a **story** — a generator function that
yields typed actions. The scaffolded shell service ships one: the health
route you just curled.

```typescript title="apps/myapp/services/shell/service/src/entry/controller/health/health.ts"
import {
  askDateNow,
  AskResponse,
  HTTPEvent,
  HTTPEventResponse,
  qpqWebServerUtils,
} from 'quidproquo';
import { dynamicRoute } from 'quidproquo-features';

export const health = dynamicRoute(
  ['GET', '/health'],
  function* healthCheck(event: HTTPEvent): AskResponse<HTTPEventResponse> {
    const checkedAt = yield* askDateNow();

    return qpqWebServerUtils.toJsonEventResponse({
      status: 'healthy',
      service: 'shell',
      checkedAt,
    });
  }
);
```

The story never reads the clock itself — it *asks* for the time by yielding
an action, and the runtime answers. On your machine that's the dev server;
in production it's whatever platform the app is deployed to. Same story,
zero changes.

Add your own route by dropping a file next to `health.ts`, exporting it from
the controller `index.ts`, and saving — the dev server rebuilds and restarts
itself.

## Deploy it

Both scaffolded environments deploy as a single docker image — the whole
app, one container:

```bash
npm run go
```

Pick an environment when prompted (or pass `--env development`), and the
build prints the `docker run` command when the image is ready:

```bash
docker run --rm -p 80:8080 -p 8080:8080 -p 8888:8888 -p 3001:3001 \
  -v qpq-myapp-data:/app/.qpq-runtime \
  qpq-myapp:development
```

Then open [http://localhost](http://localhost). Environments live in
`apps/myapp/deploy.config.json` — an app can move platforms (docker → AWS)
with a config change, not a rewrite.

## Options

```bash
npx create-qpq-app <app-name> [options]

--language <typescript|javascript>   skip the language prompt
--domain <domain>                    app domain (default: <app-name>.example.com)
--no-git                             skip git init
--no-install                         skip npm install (and the initial build)
```

Prefer plain JavaScript? `--language javascript` generates the same app with
type annotations stripped and JSX preserved — it runs on the same toolchain.

## Next steps

- [Core Concepts](./core-concepts.md) — stories, actions and processors in depth
- [Architecture Overview](./architecture-overview.md) — how the runtime executes a story
- [API Reference](./api/index.md) — the full action catalogue
