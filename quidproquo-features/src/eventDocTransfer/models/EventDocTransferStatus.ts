/**
 * What an import would do (or did) to ONE doc, as decided by comparing the incoming log against the
 * target's (see findEventDocLogDivergence).
 *
 * Only `New` and `FastForward` write anything of their own accord. Everything else is either already
 * satisfied or blocking, because the plan is the review gate: a doc the operator has not been shown
 * and agreed to is never written. `Overwritten` is the one exception, and it only ever appears after
 * an explicitly forced apply.
 */
export enum EventDocTransferStatus {
  /**
   * No doc with this id exists in the target, so the whole log is written from index 0.
   *
   * Distinct from `FastForward` because there is no shared prefix to verify: nothing can disagree,
   * so nothing can block. It is also the status a promotion into a fresh environment produces for
   * every doc in the bundle.
   */
  New = 'new',

  /**
   * The target's log is a strict PREFIX of the incoming one, so only the missing tail is written.
   *
   * The only safe merge, and the reason ids are preserved across environments: the target keeps the
   * history it already had and gains what came after, rather than being replaced. Existing events are
   * never touched.
   */
  FastForward = 'fastForward',

  /**
   * The two logs are identical. Nothing to do.
   *
   * Exists so that re-importing a bundle is a VISIBLE no-op rather than something that looks like a
   * failure or silently writes again. Idempotence is a property of the writes; this is how the
   * operator sees it.
   */
  Same = 'same',

  /**
   * The target holds events the bundle does not, or the shared prefix disagrees outright. Someone
   * edited this doc directly in the target. BLOCKING: nothing is written.
   *
   * Exists to refuse rather than clobber. Both shapes (target ahead, and a genuine mismatch) land
   * here because the remedy is the same, and this is the status the forced overwrite keys on.
   */
  Diverged = 'diverged',

  /**
   * A DIFFERENT doc IN THIS COLLECTION already owns this doc's `code`. BLOCKING: nothing is written.
   *
   * Scoped exactly as far as code lookups are: `askEventDocGetByCode` lists by the collection's
   * `type` within the ambient storage scope, so this only ever means "another doc of the same type,
   * in the same tenant". Codes are free to repeat across collections and across tenants.
   *
   * Kept separate from `Diverged` because the logs may agree perfectly - the problem is not this
   * doc's history at all. It blocks rather than warns because `askEventDocGetByCode` THROWS on more
   * than one match, so importing would break lookups for the incoming doc AND the one already there.
   * It is also why a forced overwrite deliberately skips these: discarding THIS doc's tail cannot
   * free a code that something else holds. Renaming or removing the other doc is the only fix.
   */
  CodeConflict = 'codeConflict',

  /**
   * The target's divergent tail was discarded (backed up to the transfer drive first) and the
   * bundle's version written over it.
   *
   * Report-only: a plan never predicts this, because it only happens when an apply is explicitly
   * forced. Distinct from `FastForward` so the result reads as "something here was destroyed",
   * with `discardedEvents` saying how much.
   */
  Overwritten = 'overwritten',

  /**
   * The bundle carries no events at all for this doc, so there is nothing to write and nothing to
   * compare against.
   *
   * Defensive: an export never emits an empty log, since every doc opens with INIT_STATE, so this
   * only fires for a hand-edited bundle. Kept distinct from `Same` because "we agree" and "there was
   * nothing to agree about" are different answers.
   *
   * NOTE: this is NOT how a soft-deleted doc is reported. `deletedAt` lives on the summary rather
   * than the log, so folding a bundle's events can never produce it; deleted docs are detected at
   * EXPORT time instead (the manifest marks them and leaves them out of the bundle entirely).
   */
  Ignored = 'ignored',
}
