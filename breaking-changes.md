# Breaking Changes

Running log of breaking changes, grouped by target release version. Add a dot point per breaking change as it lands so the release notes can be
assembled quickly.

## vNext

- `defineEnvironmentSettings` now takes a single `settingsByEnvironment: Record<string, QPQConfig>` map instead of `(environment, settings)`. Use
  `'*'` as a catch-all key for settings that apply to any environment. All call sites using the old two-arg form must be updated.
- `defineLogs(rootDomain, services, advancedSettings?)` is removed from `quidproquo-webserver`. Use `defineAdminSettings(logServiceName, rootDomain, advancedSettings?)` instead — the service list moves into `advancedSettings.services`, and admin-only resources are now scoped to `logServiceName` via `defineServiceSettings`.
- `defineExposeAdminAdvancedSettings(ownerModule, rootDomain)` is removed from `quidproquo-webserver`. Its resources (admin event bus, config queue, websocket queue, foreign-ref logs drive) are now emitted automatically by `defineAdminSettings` for every service that calls it; delete any direct calls to the old helper.
