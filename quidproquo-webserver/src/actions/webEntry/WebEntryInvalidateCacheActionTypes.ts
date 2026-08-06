import { WebEntryActionType } from './WebEntryActionType';

// Payload
export interface WebEntryInvalidateCacheActionPayload {
  webEntryName: string;
  paths: string[];
}
