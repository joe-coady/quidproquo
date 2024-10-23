import { askConfigGetApplicationInfo,AskResponse } from 'quidproquo-core';

import { getDomainRoot } from '../utils';

export function* askGetDomainRoot(rootDomain: string): AskResponse<string> {
  const appInfo = yield* askConfigGetApplicationInfo();

  return getDomainRoot(rootDomain, appInfo.environment, appInfo.feature);
}
