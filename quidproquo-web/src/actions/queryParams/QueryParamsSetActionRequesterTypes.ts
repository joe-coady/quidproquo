import { QueryParamsActionType } from './QueryParamsActionType';

// Payload
export type QueryParamsSetActionPayload = {
  key: string;
  values: string[];
  createHistoryEntry: boolean;
};
