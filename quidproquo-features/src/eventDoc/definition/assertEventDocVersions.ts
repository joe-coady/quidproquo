import { EVENT_DOC_PRIMARY_VIEW } from './types/EventDocLatestViews';
import { EventDocVersions } from './types/EventDocVersion';

// Definition-time guards on a doc type's version history. These throw at MODULE LOAD —
// the cheapest place to diagnose them — rather than mid-fold on someone's document, which
// is where the same mistakes would otherwise surface: as a migration that isn't there, or
// a view that quietly stopped folding.
//
// Every rule here exists because its absence fails silently:
//
//  - a gap in the chain      -> the fold cannot climb past it
//  - schemaVersion mismatch  -> a version folder written but never wired up stays inert,
//                               and the doc keeps authoring events at the old version
//  - a view missing at some  -> that view stops folding at that version and reads as a
//    version                    document that simply stopped changing
//  - no `document` view      -> nothing to mount, gate, or walk references from
export const assertEventDocVersions = (versions: EventDocVersions, schemaVersion: number): void => {
  const [base, ...rest] = versions;

  versions.forEach((version, index) => {
    if (version.version !== index + 1) {
      throw new Error(
        `Event doc versions must be contiguous from 1 with no gaps or repeats, oldest first — found version ${version.version} at position ${index + 1} (declared: ${versions.map((entry) => entry.version).join(', ')}).`,
      );
    }
  });

  const latest = versions[versions.length - 1].version;
  if (latest !== schemaVersion) {
    throw new Error(
      `Event doc schemaVersion is ${schemaVersion} but the newest declared version is ${latest} — add the missing version to \`versions\`, or correct schemaVersion.`,
    );
  }

  const viewNames = Object.keys(base.views);

  if (!viewNames.includes(EVENT_DOC_PRIMARY_VIEW)) {
    throw new Error(`Every saved event doc must declare a '${EVENT_DOC_PRIMARY_VIEW}' view — found: ${viewNames.join(', ') || 'none'}.`);
  }

  // Each version names every view, so a no-op migration has to be typed out rather than
  // defaulted. An explicit `(state) => state` is evidence someone decided this view was
  // unaffected; a defaulted one is evidence of nothing.
  rest.forEach((version) => {
    const names = Object.keys(version.views);
    const missing = viewNames.filter((name) => !names.includes(name));
    const extra = names.filter((name) => !viewNames.includes(name));

    if (missing.length > 0 || extra.length > 0) {
      throw new Error(
        `Event doc version ${version.version} must declare exactly the same views as version 1 (${viewNames.join(', ')})` +
          `${missing.length > 0 ? ` — missing: ${missing.join(', ')}` : ''}` +
          `${extra.length > 0 ? ` — unexpected: ${extra.join(', ')}` : ''}.` +
          ` A view whose shape did not change at this version still declares itself, with migrateFromPrevious: (state) => state.`,
      );
    }
  });
};
