import { createActionRequester } from 'quidproquo-core';

import { DnsActionType } from './DnsActionType';

export const askDnsList = createActionRequester<string[]>()({
  actionType: DnsActionType.List,
});
