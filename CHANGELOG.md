# Changelog

## 0.1.10

- event-doc workspace frontend state module: fold history at write time, transient (never-saved) event streams, typed per-slot errors, typed effects
  with asset transport, plus a new event-doc list state module
- logout and refresh-token work: revoke refresh token and global sign-out actions, configurable token refresh buffer, and preserve the existing
  refresh token when cognito doesn't rotate it
- circular import detection in the cli (`qpq check:circular`) and rspack builds, failing the build by default
- contentDisposition support for upload secure urls
- eslint-config: new yield-star and ask-prefix lint rules, and the qpq plugin is now exported for standalone use
- fix nested implementation stories dropping the caller's globals/context, and ai attachment scope resolution
- cli hardening: validate synth service names, shell-less spawn, and correctly quoted docker args
- new logo mark and a title shine effect on the nav

### Breaking changes

- `askApiRequest` and the `Api` action move from `quidproquo-web` to `quidproquo-webserver` (action type string changed too)
- reserved event-doc effects renamed to `EventDoc*` and now carry plain event data instead of pre-wrapped payloads
- `askUIEventDocWorkspaceApplyEvent` drops its `isPending` arg; every commit now lands in the slot's `pending` buffer
- `EventDocWorkspaceState` gains required `historyViews` and `transient` fields; the initial/reducer builders take slot configs
- `selectEventDocWorkspaceIsDirty`/`IsSaving` and `foldSlotHistory` removed; use a workspace's own selectors
- event-doc workspace slot errors are now typed (`EventDocWorkspaceSlotError`), and `askUIEventDocWorkspaceClearError` is the way to clear them
- `qpq check:circular` and the rspack circular-check plugin fail by default; `--error`/`QPQ_CIRCULAR_DEPS_ERROR` replaced by `--warn`/`QPQ_CIRCULAR_DEPS_WARN`

## 0.1.9

- eventDoc render route honors `renderMode=published`: renders the version published as of a given time instead of always the full draft log, backed
  by new `askEventDocPublishedVersionAsOf` and `askEventDocEventsAsOf` resolvers
- tenant routes split: the tenant collection stays at `basePath`, membership routes (list mine, create, logo) move to a new `myTenantsBasePath`;
  eventDoc routes gain an `excludeRoutes` option to skip stock endpoints
- web-admin: show basePath in log summary details

### Breaking changes

- the eventDoc render route now throws `NotFound` for `renderMode=published` with nothing published; `EventDocRenderInput` gains a `version` field
- `defineTenant` now requires `myTenantsBasePath`; membership routes move there and stock eventDoc CRUD mounts at `basePath` directly

## 0.1.8

- tenant support: typed `TENANT#`/`PERSONAL#` storage scopes across file, kvs and websockets, an owner-gated tenant registry, and a scoped tenant
  collection
- tenant branding: logo as an uploaded asset ref (with a presigned url route), typed primary/secondary brand colors
- security review sweep across core and webserver: action-typed errors instead of generic ones, cross-tenant scope leak fixes, validator hardening
- streaming event-doc ai chat with tool calling, replacing the old admin log chat
- client-side ai tools: optional executor, halt the turn to ask the user, resumable turns on halt
- typed ai stream finish reasons and a much wider `AiStreamPart` union
- new cli commands: interactive menu for bare `qpq`, `clear-resources` to empty buckets/tables, positional args for `go`/`go:docker`, federated remote
  publish on deploy
- concurrent workspace builds with a multi-lane progress bar and dependency-ordered parallel hooks
- websocket queue and admin log service moved into `quidproquo-features`
- dev server: type watcher, view hot reload, linked package aliasing, per-app runtime scoping
- dev server kvs backend swapped from sqlite to json files
- waf rule action overrides for managed rule groups
- deploy-awscdk: role IAM grants moved to managed policies to dodge the inline policy cap
- module federation expose bundles now split shared chunks
- queue config resolved from qpqConfig instead of env json
- narrower own-code detection in node story traces
- dev process handling: sweep lingering qpq processes before the dev server starts, without killing the caller's own process chain
- deploy-rspack loads markdown imports as raw source
