import { EventDocDocument, EventDocEvent } from '../../models';
import { EventDocWorkspaceDocumentSlotConfig } from '../../workspace/types/EventDocWorkspaceDocumentSlotConfig';
import { EventDocWorkspaceLocalSlotConfig } from '../../workspace/types/EventDocWorkspaceLocalSlotConfig';
import { EventDocWorkspaceStoryApi } from '../../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocGenericApi } from '../eventDocGenericApi';

// The canonical home of a doc type: fold config + the doc's own api, structurally a
// workspace slot config so it mounts VERBATIM at any slot key. The api includes the
// generic identity/lifecycle verbs (merged by createEventDocDefinition), and `fold`
// is the doc's one true log fold — list pages, backend logic, and tests all fold
// through here instead of hand-assembling {seed, reducer, migrations, latestVersion}.
export type EventDocDefinition<TView extends EventDocDocument, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceDocumentSlotConfig<
  TView,
  TApi & EventDocGenericApi
> & {
  fold: (events: EventDocEvent[]) => TView;
};

// An unsaved doc has no server log, so nothing to fold — it IS its slot config.
export type EventDocUnsavedDefinition<TView, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceLocalSlotConfig<TView, TApi>;
