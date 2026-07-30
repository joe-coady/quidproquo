import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsQueryOperation } from './types';

// Options Type
export interface KeyValueStoreQueryOptions {
  // Accepted but not implemented: no processor applies a TTL to query results.
  ttlInSeconds?: number;
  sortAscending?: boolean;
  limit?: number;
  nextPageKey?: string;
  filter?: KvsQueryOperation;
  // Composed into partition-key conditions by the processor; requires a string-typed partition key.
  scope?: string;
  // Read the writer's own most recent writes, at the cost of a slower and (on DynamoDB) doubly-charged
  // read.
  //
  // Default reads are EVENTUALLY consistent, which is right for a viewer and wrong for a caller that just
  // wrote and is now reading back to decide something. That case is not hypothetical: a flow run appends
  // its terminal event and immediately re-lists the log to fold the outcome, and under load the terminal
  // event is intermittently not yet visible — so a run that succeeded reads back as having no outcome at
  // all, with nothing recorded to explain it.
  //
  // Use it for read-your-own-writes and for any fold used as a COORDINATION primitive (deciding "am I
  // last", "did this finish"). Do not use it for ordinary reads.
  consistentRead?: boolean;
}

// Payload
export interface KeyValueStoreQueryActionPayload {
  keyValueStoreName: string;

  keyCondition: KvsQueryOperation;

  options?: KeyValueStoreQueryOptions;
}

// Action
export interface KeyValueStoreQueryAction extends Action<KeyValueStoreQueryActionPayload> {
  type: KeyValueStoreActionType.Query;
  payload: KeyValueStoreQueryActionPayload;
}

// Function Types
export type KeyValueStoreQueryActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreQueryAction, QpqPagedData<KvsItem>>;
export type KeyValueStoreQueryActionRequester<KvsItem> = ActionRequester<KeyValueStoreQueryAction, QpqPagedData<KvsItem>>;
