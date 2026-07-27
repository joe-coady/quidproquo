# Security findings

## create-qpq-app/src/cli/runCreateQpqApp.ts
- **Severity**: low
- **Issue**: The `--domain` value is never validated and is interpolated verbatim into generated source (`packages/constants/src/domain.ts` via `replaceInFileExact`), so a crafted value can inject arbitrary code into the scaffolded app. Only affects the user scaffolding their own app on their own machine, so the practical risk is self-injection only.
- **Where**: `runCreateQpqApp` (domain answer), applied in `steps/006_applyDomain.ts`.
- **Suggested fix**: Validate the domain against a hostname regex (letters, digits, hyphens, dots) before running steps, mirroring the app-name check in `001_preflight.ts`.
- **Status**: recorded
