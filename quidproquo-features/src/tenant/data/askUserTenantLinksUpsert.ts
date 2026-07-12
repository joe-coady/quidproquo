import { askKeyValueStoreUpsert, AskResponse } from 'quidproquo-core';

import { USER_TENANT_LINKS_STORE } from '../constants/tenantStoreNames';
import { UserTenantLinks } from '../models/UserTenantLinks';

export function* askUserTenantLinksUpsert(links: UserTenantLinks): AskResponse<void> {
  return yield* askKeyValueStoreUpsert<UserTenantLinks>(USER_TENANT_LINKS_STORE, links);
}
