---
description: Build the CHANGELOG.md entry for the version being released
---

Build the changelog entry for the release that is about to be published, and do the release-time bookkeeping in `breaking-changes.md`. This command runs from the `go` script right after `npm run patch`, so the new version numbers are sitting in the working tree uncommitted. It must work non-interactively: never stop to ask a question, make the sensible call and note it in the final report instead.

## Steps

### 1. Work out the new version (V)

Read `"version"` from the working-tree `quidproquo-core/package.json`. That is V, the version this entry is for.

### 2. Work out the previous version (P) and the commit range

1. Get the committed version: `git show HEAD:quidproquo-core/package.json | grep '"version"'`.
2. If that differs from V (the normal case, bump not yet committed), it is P.
3. If it equals V (the bump was already committed), walk back through `git log --format=%H -- quidproquo-core/package.json`, checking `git show <sha>:quidproquo-core/package.json` at each, until you hit a commit whose version is not V. That version is P.
4. Find the boundary commit B, the commit that bumped the version **to** P: run `git log -S '"version": "<P>"' --format='%H %s' -- quidproquo-core/package.json` and for each candidate check `git show <sha>:quidproquo-core/package.json` until you find the newest sha where the version actually equals P (`-S` also matches the commit that later removed the string, skip that one).
5. Sanity check: B is usually a commit with a subject like `bump: <P>`. If what you found looks wrong (e.g. version at B is not P), fall back to searching subjects: `git log --format='%H %s' | grep 'bump: <P>'`.

The release range is `B..HEAD`, minus any commit that is itself the bump for V.

### 3. Read the commits

Run `git log --format='%h %s' <B>..HEAD`. For anything whose subject doesn't tell you what it means for a consumer, look closer with `git show --stat <sha>` or the diff. Then turn the range into feature bullets:

- Write for someone who uses the packages, not someone reading the repo. Say what they can now do or what got fixed.
- **Group related commits into one bullet.** A feature that landed across five commits (e.g. tenant branding, or a cli command plus its follow-up fixes) is one line, not five.
- Drop noise entirely: `wip`, formatting-only commits, bump commits, lockfile-only changes, tweaks to commits that are already covered by another bullet.
- Keep each bullet short, lowercase-leaning, and in the same terse voice as the commit subjects. One line each.
- Order roughly by significance, biggest features first, small fixes last.

### 4. Collect breaking changes

Read `breaking-changes.md` and take the bullets under `## vNext`. Those are detailed migration notes; condense each one to a single short line for the changelog (what broke and the one-word gist of the fix, e.g. `defineTenant now requires an owner module`). The full migration detail stays in `breaking-changes.md`, so don't repeat it.

If a commit in the range is clearly breaking but has no vNext bullet, include it in the changelog's breaking section anyway and mention the gap in your final report.

### 5. Write the CHANGELOG.md entry

Insert the new entry into `CHANGELOG.md` directly below the top `# Changelog` heading, above any existing version entries:

```
## <V>

- feature bullet
- feature bullet

### Breaking changes

- condensed one-liner
- condensed one-liner
```

- Omit the `### Breaking changes` section entirely if there are none.
- If a `## <V>` section already exists (a rerun after a failed `go`), replace that whole section with the freshly built one instead of stacking a duplicate.

### 6. Roll breaking-changes.md forward

In `breaking-changes.md`, rename the `## vNext` heading to `## <V>` and add a fresh empty `## vNext` heading above it. Edge cases on rerun:

- `## <V>` already exists and `## vNext` is empty: nothing to do.
- `## <V>` already exists and `## vNext` has bullets: move those bullets into the existing `## <V>` section and leave `## vNext` empty.

### 7. Report

Do not commit anything; the release bump commit picks these files up later. Finish by reporting: V, P, the boundary commit, how many commits were summarized into how many bullets, and the paths you edited.

## Hard rules

- **Never** use em dashes anywhere. Use a period, comma, colon, or parentheses.
- No AI tells in the writing: no "leverage", "seamless", "robust", "enhanced", no rule-of-three sentences, no forced symmetry. It should read like the person who wrote the commit messages also wrote the changelog.
- Never invent a feature you can't point at a commit for, and never pad thin releases. Two honest bullets beat six vague ones.
- Never mention Claude, AI, or any tool attribution anywhere in the output.
- Only edit `CHANGELOG.md` and `breaking-changes.md`. Do not touch package files, do not build, do not commit, do not push.
