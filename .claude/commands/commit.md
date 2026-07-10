---
description: Commit currently staged changes with a package-prefixed message
---

Commit the changes that are currently staged in git. Do **not** stage anything yourself — work only with what's already in the index.

## Steps

1. Run `git diff --cached --name-only` to get the list of staged files. If nothing is staged, stop and tell the user there is nothing to commit.
2. Run `git diff --cached` to read the actual staged changes so the message reflects what was done, not just which files changed.
3. **Check for breaking changes** (see "Breaking changes" section below). If the staged diff contains any, append a bullet for each to `breaking-changes.md` under the `## vNext` heading, then `git add breaking-changes.md` so it rides in this same commit.
4. **Check for fundamental changes that affect documentation** (see "Documentation updates" section below). If the staged diff adds or changes a documented action, config helper, or feature, create or update the relevant page(s) under `quidproquojs.com/docusaurus/docs/`, then `git add` those files by name so they ride in this same commit. Together with step 3, this is the **only** case in which this command is allowed to stage files beyond what was already staged by the user.
5. Determine the **prefix**:
   - For each staged file, take its top-level directory. If it starts with `quidproquo-`, that's the package.
   - Collect the unique set of packages touched.
   - **Exactly one package** → prefix is that package name with `quidproquo-` stripped, followed by `: `. Examples:
     - `quidproquo-core` → `core: `
     - `quidproquo-actionprocessor-node` → `actionprocessor-node: `
     - `quidproquo-webserver` → `webserver: `
   - **Two or more packages**, or changes only in root/tooling files → **no prefix**.
6. Write a **short, lowercase-leaning, human-sounding** summary of the change (1 line, ideally under ~70 chars). Match the terse style of recent commits like `text support for network request`, `stream json types`, `added disableReservedConcurrency to aws config`.
7. Run the commit:
   ```
   git commit -m "<prefix><summary>"
   ```
   Use `-m` with a single line. No body, no trailers.
8. Run `git status` after to confirm the commit landed, then report the commit message you used. If you appended to `breaking-changes.md` or touched any docs pages, mention those too (list the paths).

## Breaking changes

A breaking change is anything that forces downstream callers to update their code. In this monorepo that usually means:

- An exported function's signature changed (args added/removed/reshaped, return type narrowed).
- An exported type, interface, class, or enum had a required field added or a field removed/renamed.
- An exported symbol was removed or renamed.
- A `define*` config helper's shape changed in a way that existing config files won't compile against.
- Runtime behavior of a public API changed in a way a caller depends on (e.g. default value flipped, silent failure became a throw).

When you find one, append a bullet under the `## vNext` heading in `breaking-changes.md`. `vNext` is always the active bucket for unreleased breaking changes — at release time the user renames it to the release version and starts a fresh `## vNext` above it. Do not create or rename version headings yourself.

The bullet should:

- Be written for a **consumer** of the package, not for someone reading the internals. Say what they have to change in their own code to migrate — nothing more.
- State the old and new shape concretely (e.g. `foo(a, b)` → `foo({ a, b })`).
- Note the migration in one line if it isn't obvious.
- Stay terse — one dot point per change, no prose paragraphs.
- **Do not** mention internal mechanics (which helper the replacement delegates to under the hood, which resources it emits internally, refactor reasons, etc.) unless that detail is genuinely required for a caller to migrate.

If `breaking-changes.md` doesn't exist yet, or there is no `## vNext` heading, **stop and ask the user** rather than creating one yourself.

Non-breaking additions (new exports, new optional fields, internal refactors that don't change any public shape) do **not** belong in `breaking-changes.md`.

## Documentation updates

The docs site lives at `quidproquojs.com/docusaurus/docs/`. It's a hand-written reference, one page per action requester or `define*` config helper, organized under `docs/actions/<layer>/<domain>/` and `docs/config/<layer>/<domain>.md` (`layer` is `core`, `webserver`, `features`, `xstate`, `neo4j`, or `config-aws`, matching the source package). The sidebar (`sidebars.ts`) autogenerates from this directory tree, so a new file in the right folder is all that's needed to appear in nav — no manual registration.

A staged change is **fundamental** (docs-worthy) when it does any of the following to something a consumer of a package would use:

- Adds a new exported action requester (an `ask*` generator in `quidproquo-core/src/actions/**` or an equivalent in another package's action layer).
- Adds a new exported `define*` config helper, or a new option on an existing one.
- Changes an existing documented action's or config helper's signature, parameters, defaults, return shape, or error enum.
- Changes documented runtime behavior (anything already described in prose on an existing page).
- Adds a genuinely new concept significant enough that `core-concepts.md`, `architecture-overview.md`, or `use-cases.md` no longer accurately describe the system.

It is **not** docs-worthy when the change is an internal refactor, a processor-only fix that doesn't change the action's public contract, a test change, or a bug fix that doesn't change already-documented behavior.

When you find a docs-worthy change:

1. **Read the real, current source before writing anything** — the action requester's generator signature, its option/param types, the processor's error enum, any JSDoc. Do not infer parameter names, types, defaults, or error names from the diff alone if the full file makes it ambiguous — open the file. Never invent or guess content; if you can't verify something from the code, leave it out rather than assume.
2. Find the matching page by the naming convention: action pages are named after the kebab-case of the function (`askNetworkRequest` → `ask-network-request.md`) inside a kebab-case domain folder (`keyValueStore` → `key-value-store/`); config pages are named after the kebab-case of the setting (`defineAi` → `ai.md`).
3. **Page already exists** → update only the sections that actually changed (`## Signature`, `## Parameters`, `## Returns`, `## Errors`, `## Notes`), keeping the existing prose style and structure intact.
4. **No page exists yet** (brand-new action/config) → first read 2–3 sibling pages in the same directory to match tone and structure exactly, then create a new page with the same shape: frontmatter (`title`, `description`), an intro paragraph, an `## Signature` code block, `## Parameters` (and any nested option-object tables), `## Returns`, `## Errors` (only if the action can throw a mapped error), `## Notes` for anything non-obvious, and `## Related` linking sibling pages. If the domain folder itself is new, copy the shape of a sibling `_category_.json` into it.
5. Stage the new/changed doc files explicitly by name — same rule as `breaking-changes.md`, never a broad `add`.
6. If it's genuinely unclear whether a change rises to "fundamental," or the right page/section isn't obvious from the naming convention, ask the user rather than guessing.

## Hard rules

- **Never** add a `Co-Authored-By` trailer.
- **Never** mention Claude, AI, "generated by", or any attribution of authorship to a tool. The message must look like the user wrote it themselves.
- **Never** use `-A`, `add .`, or otherwise stage files. The exceptions are `breaking-changes.md` (step 3) and docs pages under `quidproquojs.com/docusaurus/docs/` (step 4) — stage those explicitly by name, nothing else.
- **Never** use `--no-verify` or skip hooks. If a hook fails, fix the underlying issue or report it — do not bypass.
- If the staged diff spans multiple packages but is clearly one logical change (e.g. a new action added across core + processors), still drop the prefix — the 2+ packages rule wins.
- Keep the message a single line. No multi-line body unless the user explicitly asks.

## Examples

- Staged: only files under `quidproquo-core/src/actions/network/` → `core: text support for network request`
- Staged: files under `quidproquo-actionprocessor-node/` only → `actionprocessor-node: handle empty response body`
- Staged: files in `quidproquo-core` and `quidproquo-actionprocessor-lambda` → `stream json types` (no prefix)
- Staged: only `package.json` and `package-lock.json` at the root → `bump: 0.0.624` (no package prefix)
