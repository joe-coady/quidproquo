// How an import behaves when it meets a doc the target has edited directly.
export type EventDocBundleApplyOptions = {
  // Which staged bundle this is, so discarded events can be parked next to it.
  transferId: string;
  /**
   * Discard the target's divergent tail and take the bundle's version. OFF by default and never
   * implicit: it deletes events the target owns, and it rewrites published version history, so any
   * render already produced against those versions stops being reproducible. Applies ONLY to
   * diverged rows - a code conflict is a different problem that overwriting cannot fix.
   */
  force?: boolean;
};
