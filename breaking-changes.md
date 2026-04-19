# Breaking Changes

Running log of breaking changes, grouped by target release version. Add a dot point per breaking change as it lands so the release notes can be
assembled quickly.

## vNext

- `defineEnvironmentSettings` now takes a single `settingsByEnvironment: Record<string, QPQConfig>` map instead of `(environment, settings)`. Use
  `'*'` as a catch-all key for settings that apply to any environment. All call sites using the old two-arg form must be updated.
- `defineLogs(rootDomain, services, advancedSettings?)` is removed from `quidproquo-webserver`. Replace with `defineAdminSettings(logServiceName, rootDomain, advancedSettings?)` — the service list moves into `advancedSettings.services`.
- `defineExposeAdminAdvancedSettings(ownerModule, rootDomain)` is removed from `quidproquo-webserver`. Delete the call — every service that calls `defineAdminSettings` now gets these resources automatically.
- Lambda and Lambda@Edge functions deployed via `quidproquo-deploy-awscdk` now run on Node 22 (was Node 20). Verify your function code and dependencies are Node 22 compatible before redeploying.
