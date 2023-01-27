import { randomUUID } from 'crypto';
import { match } from 'node-match-path';
import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

export const randomGuid = () => {
  return randomUUID();
};

export interface UrlMatch {
  didMatch: boolean;
  params: Record<string, string> | null;
}

export const matchUrl = (path: string, url: string): UrlMatch => {
  // /attempt/{attemptUuid}/result/{test} => /attempt/:attemptUuid/result/:test
  const modifiedPath = path.replaceAll(/{(.+?)}/g, (m, g) => `:${g}`);

  const matchResult = match(modifiedPath, url);
  return {
    didMatch: matchResult.matches,
    params: matchResult.params,
  };
};

export const getRuntimeResourceName = (
  resourceName: string,
  qpqConfig: QPQConfig,
  resourceType: string = '',
) => {
  const service = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationEnvironment(qpqConfig);

  return `${resourceName}-${service}-${environment}${resourceType}`;
};
