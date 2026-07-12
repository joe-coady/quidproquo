import { askKeyValueStoreGet, AskResponse } from 'quidproquo-core';

import { USER_TENANT_LINKS_STORE } from '../constants/tenantStoreNames';
import { UserTenantLinks } from '../models/UserTenantLinks';

export function* askUserTenantLinksGet(userId: string): AskResponse<UserTenantLinks | null> {
  return yield* askKeyValueStoreGet<UserTenantLinks>(USER_TENANT_LINKS_STORE, userId);
}
