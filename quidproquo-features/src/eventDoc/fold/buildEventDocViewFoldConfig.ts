import { QpqReducer } from 'quidproquo-core';

import { EventDocBaseViewVersion } from '../definition/types/EventDocBaseViewVersion';
import { EventDocNextViewVersion } from '../definition/types/EventDocNextViewVersion';
import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from '../validation/types/EventDocEventValidators';
import { buildVersionRoutedReducer } from './buildVersionRoutedReducer';
import { EventDocMigrations } from './EventDocMigrations';
import { FoldEventDocLogConfig } from './foldEventDocLog';

// The shape a versions array presents to the fold assembler. Structural rather than
// imported wholesale so this stays usable by callers that hold only one doc type's
// history (the transformer's upstream validator, which cannot import its own definition
// without a cycle).
type EventDocVersionEntry = {
  version: number;
  views: Record<string, EventDocBaseViewVersion<any> | EventDocNextViewVersion<any>>;
};

// Assemble ONE view's fold config out of a doc type's version history. THE single place
// that turns declared versions into {seed, reducer, migrations, latestVersion} — anything
// that folds a log builds its config here, so no two readers of the same doc type can
// assemble subtly different rules for it.
//
// The seed comes from the BASE version and only ever from there. Every log opens with an
// INIT_STATE stamped version 1, so a document created under schema version 5 still starts
// at the base shape and climbs — one initial state, one path to any version, and the
// migrations exercised by every fold instead of rotting until someone opens an old doc.
export const buildEventDocViewFoldConfig = (
  versions: readonly EventDocVersionEntry[],
  viewName: string,
  schemaVersion: number,
  validators?: EventDocEventValidators<EventDocDocument>,
): FoldEventDocLogConfig<EventDocDocument> => {
  const [base, ...rest] = versions;

  const reducersByVersion: Record<number, QpqReducer<EventDocDocument, EventDocEvent>> = {};
  versions.forEach((version) => {
    reducersByVersion[version.version] = version.views[viewName].foldReducer;
  });

  const migrations: EventDocMigrations = {};
  rest.forEach((version) => {
    migrations[version.version] = (version.views[viewName] as EventDocNextViewVersion).migrateFromPrevious;
  });

  return {
    seed: (base.views[viewName] as EventDocBaseViewVersion).createInitialViewState(),
    reducer: buildVersionRoutedReducer(reducersByVersion),
    migrations,
    latestVersion: schemaVersion,
    validators,
  };
};
