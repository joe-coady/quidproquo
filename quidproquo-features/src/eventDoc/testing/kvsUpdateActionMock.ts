import { KvsCoreDataType, KvsUpdate, KvsUpdateActionType } from 'quidproquo-core';

type Row = Record<string, unknown>;

export type KvsUpdatePayload = {
  keyValueStoreName: string;
  key: KvsCoreDataType;
  sortKey?: KvsCoreDataType;
  updates: KvsUpdate;
  options?: { scope?: string };
};

export type KvsUpdateMockConfig = {
  // Resolve the rows this update targets. Scope-partitioned tests key their tables by
  // scope so isolation is real; flat tests ignore it.
  tableFor: (scope: string | undefined, storeName: string) => Row[];
  keyName: string;
  sortKeyName: string;
  // Called with every scope that reaches the action, for tests asserting scope threading.
  onScope?: (scope: string | undefined) => void;
};

// In-memory stand-in for the KeyValueStore/Update action, matching the DynamoDB semantics
// the real processor produces: UpdateItem UPSERTS (a missing row is created from the key),
// Increment renders as `if_not_exists(attr, :default) + :value`, and the call returns the
// whole row as stored afterwards (ReturnValues ALL_NEW).
//
// Shared by the eventDoc round-trip tests because the append path now claims its log index
// through this action, so every test that drives a real append needs it.
export const createKvsUpdateMock =
  ({ tableFor, keyName, sortKeyName, onScope }: KvsUpdateMockConfig) =>
  (action: { payload: KvsUpdatePayload }): Row => {
    const { keyValueStoreName, key, sortKey, updates, options } = action.payload;
    onScope?.(options?.scope);

    const table = tableFor(options?.scope, keyValueStoreName);

    let row = table.find((item) => item[keyName] === key && (sortKey === undefined || item[sortKeyName] === sortKey));

    if (!row) {
      row = { [keyName]: key, ...(sortKey === undefined ? {} : { [sortKeyName]: sortKey }) };
      table.push(row);
    }

    for (const update of updates) {
      const attribute = Array.isArray(update.attributePath) ? String(update.attributePath[0]) : update.attributePath;

      switch (update.action) {
        case KvsUpdateActionType.Set:
          row[attribute] = update.value;
          break;

        case KvsUpdateActionType.Increment: {
          const current = typeof row[attribute] === 'number' ? (row[attribute] as number) : (update.defaultValue as number);
          row[attribute] = current + (update.value as number);
          break;
        }

        case KvsUpdateActionType.Remove:
          delete row[attribute];
          break;

        default:
          throw new Error(`Test KVS mock does not support update action: ${update.action}`);
      }
    }

    return { ...row };
  };
