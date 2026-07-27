import { EventDocDocument, EventDocEvent, EventDocLink } from '../models';
import { FoldEventDocLogConfig } from './foldEventDocLog';
import { foldEventDocLogStep } from './foldEventDocLogStep';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

// Collecting is a whole-log fold that stops at every step to read something off the view, so it takes
// the fold's own config plus the thing doing the reading. (The collector is spelled out rather than
// imported as EventDocReferenceCollector: that type lives under definition/, which already imports
// from fold/, and pointing back the other way would close a cycle.)
export type CollectEventDocReferencesConfig<TState extends EventDocDocument> = FoldEventDocLogConfig<TState> & {
  references: (view: TState) => EventDocLink[];
};

// Two links to the same doc collapse regardless of resolution mode: the transfer takes the target's
// whole log either way, so a `latest` and a `version`-pinned pointer are the same dependency.
const referenceKey = (link: EventDocLink): string => `${link.eventDocService}:${link.eventDocType}:${link.id}`;

/**
 * Every doc this one has EVER referenced, by walking its log and collecting at each step.
 *
 * Why every step and not just the version boundaries: an EventDocLink can pin a specific version or
 * event index of its target, and any past state of this doc may be rendered (a published render
 * resolves as of the moment it was published). A link that lived and died inside one version is
 * still reachable that way, so the manifest has to see it.
 *
 * Two details that matter:
 *
 * 1. The accumulator stays at its NATURAL version (whatever the events have carried it to) and a
 *    MIGRATED COPY is what gets collected from. Feeding the migrated state back in would hand a
 *    later v1 event's version-routed reducer a v2-shaped state.
 * 2. Collection always runs against the LATEST shape, which is exactly what a render folds to. So a
 *    `references` implementation is written once, against the current view, and a field rename is
 *    covered by the migration that already had to exist. It also means the collector can never
 *    disagree with the renderer: if a migration drops a concept, both stop seeing those links.
 *
 * Cost is one fold's worth of reducer steps plus a per-step migrate that no-ops whenever the log was
 * authored at the current version.
 */
export const collectEventDocReferences = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  { seed, reducer, migrations, latestVersion, references }: CollectEventDocReferencesConfig<TState>,
): EventDocLink[] => {
  const seen = new Set<string>();
  const collected: EventDocLink[] = [];

  let state: EventDocDocument = { ...seed };

  for (const event of events) {
    state = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion });

    const view = migrateEventDocDocumentTo(state, latestVersion, migrations) as TState;

    for (const link of references(view)) {
      const key = referenceKey(link);

      if (!seen.has(key)) {
        seen.add(key);
        collected.push(link);
      }
    }
  }

  return collected;
};
