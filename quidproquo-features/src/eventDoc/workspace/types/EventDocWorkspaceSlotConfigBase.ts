import { EventDocWorkspaceSlotFoldConfigBase } from './EventDocWorkspaceSlotFoldConfigBase';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

// The shape shared by document and local slot configs: the fold config plus the
// slot's api (scope-blind domain verbs; the factory binds them to this slot's
// stream).
export type EventDocWorkspaceSlotConfigBase<TView, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceSlotFoldConfigBase<TView> & {
  api: TApi;
};
