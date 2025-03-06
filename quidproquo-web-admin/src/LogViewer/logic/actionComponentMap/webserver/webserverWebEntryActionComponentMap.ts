import { WebEntryActionType } from 'quidproquo-webserver';

const webserverWebEntryActionComponentMap: Record<string, string[]> = {
  [WebEntryActionType.InvalidateCache]: ['askWebEntryInvalidateCache', 'entryName'],
};

export default webserverWebEntryActionComponentMap;
