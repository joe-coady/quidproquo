import { EventDocDocument } from '../../models';
import { EventDocWorkspaceDocumentSlotFoldConfig } from './EventDocWorkspaceDocumentSlotFoldConfig';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

export type EventDocWorkspaceDocumentSlotConfig<
  TView extends EventDocDocument = EventDocDocument,
  TApi extends EventDocWorkspaceStoryApi = EventDocWorkspaceStoryApi,
> = EventDocWorkspaceDocumentSlotFoldConfig<TView> & {
  api: TApi;
};
