# Changelog

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
