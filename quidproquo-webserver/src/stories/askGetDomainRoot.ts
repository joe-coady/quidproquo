import { AskResponse, askConfigGetApplicationInfo } from 'quidproquo-core';

export function* askGetDomainRoot(rootDomain: string): AskResponse<string> {
  const appInfo = yield* askConfigGetApplicationInfo();

  let domainPrefix = appInfo.environment !== 'production' ? `${appInfo.environment}.` : '';
  if (appInfo.feature) {
    domainPrefix = `${appInfo.feature}.${domainPrefix}`;
  }

  return `${domainPrefix}${rootDomain}`;
}
