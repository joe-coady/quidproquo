import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsQueryOperation } from './types';

// One row and the scope it lives under. `scope` is absent for an unscoped row.
//
// The scope is reported rather than dropped BECAUSE this crosses scopes: a caller that reads
// every tenant's rows in one pass has to know which tenant each belongs to, or anything it
// writes back lands in the wrong partition. Handing back bare items would make silent
// cross-tenant corruption the easy mistake.
export type KvsScopedItem<KvsItem> = {
  scope?: string;
  item: KvsItem;
};

// Options Type
export interface KeyValueStoreScanAllScopesOptions {
  limit?: number;
}

// Payload
export interface KeyValueStoreScanAllScopesActionPayload {
  keyValueStoreName: string;

  filterCondition?: KvsQueryOperation;

  nextPageKey?: string;

  options?: KeyValueStoreScanAllScopesOptions;
}

// Action
export interface KeyValueStoreScanAllScopesAction extends Action<KeyValueStoreScanAllScopesActionPayload> {
  type: KeyValueStoreActionType.ScanAllScopes;
  payload: KeyValueStoreScanAllScopesActionPayload;
}

// Function Types
export type KeyValueStoreScanAllScopesActionProcessor<KvsItem> = ActionProcessor<
  KeyValueStoreScanAllScopesAction,
  QpqPagedData<KvsScopedItem<KvsItem>>
>;
export type KeyValueStoreScanAllScopesActionRequester<KvsItem> = ActionRequester<
  KeyValueStoreScanAllScopesAction,
  QpqPagedData<KvsScopedItem<KvsItem>>
>;
