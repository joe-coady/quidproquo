// The output of one snapshot fold: every view of the doc type (the `document` primary,
// the built-in `summary`, and any declared secondary views), each folded from the SAME
// accepted event set, keyed by view name.
//
// Values are `unknown` deliberately: a snapshot state is ERA-PINNED (folded to the schema
// version its log prefix actually reached — see foldEventDocLogAsWritten), so the
// definition's latest-version view types do not apply to it. A consumer migrates a
// snapshot state up before treating it as latest-shaped.
export type EventDocSnapshotViews = Record<string, unknown>;
