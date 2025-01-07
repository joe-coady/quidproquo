import { askConfigGetApplicationInfo, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askDnsList } from '../actions';
import { getDomainRoot } from '../utils';

export function* askGetDomainRoot(rootDomain?: string): AskResponse<string> {
  const appInfo = yield* askConfigGetApplicationInfo();

  const realDomain = rootDomain || (yield* askDnsList())?.[0] || '';

  if (!realDomain) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, 'askGetDomainRoot: rootDomain not supplied');
  }

  // If its local host, we want to just leave it...
  // Note: We may want to remove this to end up with like...
  //       joecoady.development.localhost:3000
  if (realDomain.split(':')[0].toLowerCase() === 'localhost') {
    return realDomain;
  }

  return getDomainRoot(realDomain, appInfo.environment, appInfo.feature);
}
