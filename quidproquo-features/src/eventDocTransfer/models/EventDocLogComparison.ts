// How an existing log relates to an incoming one (findEventDocLogDivergence). Fast-forward is
// the ONLY safe import, so the comparison answers exactly one question: is the existing log a
// prefix of the incoming one, and if not, where do they first disagree.
export type EventDocLogComparison =
  | {
      diverged: false;
      // How many leading events the two logs share, which is also the count already present in
      // the target: everything from this index on is what an import writes.
      sharedCount: number;
      // The target holds events beyond the shared prefix (it is AHEAD, so not importable).
      existingAhead: boolean;
    }
  | {
      diverged: true;
      // Log index of the first event that differs.
      atIndex: number;
    };
