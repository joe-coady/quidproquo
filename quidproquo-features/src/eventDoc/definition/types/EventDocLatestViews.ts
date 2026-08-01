import { EventDocDocument } from '../../models';
import { EventDocBaseViewVersion } from './EventDocBaseViewVersion';
import { EventDocNextViewVersion } from './EventDocNextViewVersion';

// The name of the view every saved doc type must declare. It is the PRIMARY view: the one
// the workspace mounts as the editor's live document, the one the validators gate, and the
// one `references` walks. Secondary views (summaries, projections) are fold-only.
export const EVENT_DOC_PRIMARY_VIEW = 'document';

export type EventDocPrimaryViewName = typeof EVENT_DOC_PRIMARY_VIEW;

// The state a single view version folds to.
type EventDocViewStateOf<TViewVersion> =
  TViewVersion extends EventDocBaseViewVersion<infer TView> ? TView : TViewVersion extends EventDocNextViewVersion<infer TView> ? TView : never;

// The view shapes of the LAST entry in a versions tuple. Every fold climbs to the latest
// version before returning, so these are the shapes a consumer actually reads — the
// earlier versions exist only to fold their own era's events on the way up.
export type EventDocLatestViews<TVersions extends readonly unknown[]> = TVersions extends readonly [...unknown[], infer TLatest]
  ? TLatest extends { views: infer TViews }
    ? { [K in keyof TViews]: EventDocViewStateOf<TViews[K]> }
    : never
  : never;

// The latest shape of the primary view — what `validators`, `references`, and the mounted
// workspace slot are all typed against.
export type EventDocPrimaryView<TVersions extends readonly unknown[]> =
  EventDocLatestViews<TVersions> extends Record<EventDocPrimaryViewName, infer TView extends EventDocDocument> ? TView : never;
