// How an import behaves, and who is doing it.
export type EventDocBundleApplyOptions = {
  // Which staged bundle this is, so discarded events can be parked next to it.
  transferId: string;
  /**
   * The user id every imported event is attributed to.
   *
   * The SOURCE system's user id is deliberately NOT carried over: it resolves to nobody in the
   * target directory (guaranteed, unless the "transfer" is between two tenants of one system), which
   * leaves a foreign key pointing at nothing. The author's `userDisplayName` IS kept, so history
   * still reads as the person who actually wrote it - only the id becomes local.
   *
   * Safe for the log comparison because event identity is (type, index, version, clientMessageId,
   * createdAt) - see findEventDocLogDivergence - so re-exporting a doc and importing it back still
   * fast-forwards rather than looking diverged.
   */
  importerUserId: string;
  /**
   * Discard the target's divergent tail and take the bundle's version. OFF by default and never
   * implicit: it deletes events the target owns, and it rewrites published version history, so any
   * render already produced against those versions stops being reproducible. Applies ONLY to
   * diverged rows - a code conflict is a different problem that overwriting cannot fix.
   */
  force?: boolean;
};
