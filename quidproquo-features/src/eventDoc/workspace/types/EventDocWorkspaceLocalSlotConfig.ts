import { EventDocWorkspaceLocalSlotFoldConfig } from './EventDocWorkspaceLocalSlotFoldConfig';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

export type EventDocWorkspaceLocalSlotConfig<
  TView = unknown,
  TApi extends EventDocWorkspaceStoryApi = EventDocWorkspaceStoryApi,
> = EventDocWorkspaceLocalSlotFoldConfig<TView> & {
  api: TApi;
};
