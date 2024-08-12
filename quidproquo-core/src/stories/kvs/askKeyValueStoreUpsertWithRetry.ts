import { askRetry } from '../askRetry';
import { KeyValueStoreUpsertErrorTypeEnum, KeyValueStoreUpsertOptions, askKeyValueStoreUpsert, askThrowError } from '../../actions';
import { AskResponse } from '../../types';

export type KeyValueStoreUpsertWithRetryOptions = KeyValueStoreUpsertOptions & {
  maxRetries?: number; // default 3
};

export function* askKeyValueStoreUpsertWithRetry<KvsItem>(
  keyValueStoreName: string,
  item: KvsItem,
  options?: KeyValueStoreUpsertWithRetryOptions,
): AskResponse<void> {
  const { maxRetries = 3, ...kvsOptions } = options || {};

  const upsertResponse = yield* askRetry(
    function* askRunLogic() {
      return yield* askKeyValueStoreUpsert<KvsItem>(keyValueStoreName, item, kvsOptions);
    },
    maxRetries,
    250,
    [KeyValueStoreUpsertErrorTypeEnum.ServiceUnavailable],
  );

  if (!upsertResponse.success) {
    yield* askThrowError(upsertResponse.error.errorType, upsertResponse.error.errorText, upsertResponse.error.errorStack);
  }
}