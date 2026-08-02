/**
 * One stored snapshot: a single view's folded state at a single event, as the snapshot
 * store's row data.
 *
 * The state is ERA-PINNED — folded by foldEventDocLogAsWritten to the schema version its
 * log prefix actually reached, never climbed to whatever the code's latest was when the
 * snapshot was written. That makes a snapshot an immutable fact of the log (refolding the
 * same prefix reproduces it byte-for-byte, deploys notwithstanding) and a correct seed for
 * resuming the fold; a reader wanting latest shape migrates it up, exactly as the read
 * side does for any stored accumulator.
 *
 * The inline/storageDrive split exists because a folded state has no size bound and a KVS
 * row does (DynamoDB's 400KB item ceiling): a state small enough to inline is carried on
 * the row, anything bigger lives on the collection's blob drive at the conventional
 * snapshot path (see eventDocSnapshotPath) and the row records only that it is there —
 * the path is derived from the row's own keys, so it is not repeated here.
 *
 * `views` is the manifest of every view written at this event, stamped ONLY on the
 * `document` view's row — which is written LAST, making that row the commit marker for
 * the whole per-view set. It exists because the incremental fold must gather every view's
 * seed state, and the view names live inside the partition keys where a generic reader
 * cannot enumerate them: the document row is the one row such a reader can always address
 * (the primary view's name is a package constant), so it carries the map to its siblings.
 * A document row without a manifest (or with a missing sibling) is simply not used as a
 * seed — the fold falls back to from-scratch, which rewrites a complete set.
 */
export type EventDocSnapshot =
  | {
      type: 'inline';
      /** The view's folded state at this event. */
      snapshot: unknown;
      views?: string[];
    }
  | {
      type: 'storageDrive';
      views?: string[];
    };
