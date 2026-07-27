import { AskResponse } from 'quidproquo-core';

import { askEventDocGetByIdOrThrow, askEventDocReferences } from '../../eventDoc/logic';
import { EventDocLink } from '../../eventDoc/models';
import { EventDocDocRef, EventDocManifestItem, EventDocTransferRegistry } from '../models';
import { askEventDocTransferProvideCollection } from './askEventDocTransferProvideCollection';

// Visited-set identity. Two links to the same doc collapse regardless of resolution mode.
const manifestKey = (ref: EventDocDocRef): string => `${ref.service}:${ref.type}:${ref.id}`;

const toDocRef = (link: EventDocLink): EventDocDocRef => ({
  service: link.eventDocService,
  type: link.eventDocType,
  id: link.id,
});

type VisitResult = {
  code: string;
  name: string;
  deleted: boolean;
  links: EventDocLink[];
};

// One node: its identity (for the operator-facing list) and its outbound edges. Runs inside the
// doc's own collection store, so both reads target the right collection. A soft-deleted doc is
// reported but not walked into: it will not be bundled, so its own dependencies are moot.
function* askEventDocManifestVisit(docId: string): AskResponse<VisitResult> {
  const summary = yield* askEventDocGetByIdOrThrow(docId);

  if (summary.deletedAt) {
    return { code: summary.code, name: summary.name, deleted: true, links: [] };
  }

  const links = yield* askEventDocReferences(docId);

  return { code: summary.code, name: summary.name, deleted: false, links };
}

/**
 * Every doc that has to travel with `starts`, found by following each doc's references outward.
 *
 * Takes a LIST of roots so selecting several documents produces ONE manifest: the visited set spans
 * every root, so a stylesheet shared by three templates is walked once and lands in the bundle once.
 *
 * Breadth-first over an append-only worklist with a visited set, NOT a QPQ context: a context is
 * immutable down the story tree, so it cannot accumulate across sibling branches, which is exactly
 * what cycle detection needs. A cycle (template -> content -> template) therefore terminates on
 * the visited check instead of recursing forever.
 *
 * Discovery order is the return order, so REVERSING it is leaves-first, which is how the import
 * applies docs. That ordering is a nicety rather than a correctness property: links resolve at
 * render time, import is idempotent, and a cycle makes a strict topological order impossible
 * anyway.
 */
export function* askEventDocManifest(registry: EventDocTransferRegistry, starts: EventDocDocRef[]): AskResponse<EventDocManifestItem[]> {
  // Every root is depth 0, so "what did I ask for" stays distinguishable from "what came along".
  const queue: { ref: EventDocDocRef; depth: number }[] = starts.map((ref) => ({ ref, depth: 0 }));
  const visited = new Set<string>();
  const items: EventDocManifestItem[] = [];

  // Index cursor rather than shift(): the queue grows while it is being walked, and this keeps the
  // loop free of a non-null assertion.
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const { ref, depth } = queue[cursor];
    const key = manifestKey(ref);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const { code, name, deleted, links } = yield* askEventDocTransferProvideCollection(registry, ref, askEventDocManifestVisit(ref.id));

    items.push({ ...ref, code, name, depth, deleted });

    for (const link of links) {
      queue.push({ ref: toDocRef(link), depth: depth + 1 });
    }
  }

  return items;
}
