import { randomUUID } from 'crypto';
import { match } from 'node-match-path';

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

export const loadModule = async (src: string): Promise<any> => {
  try {
    return require(src);
  } catch {}

  return null;
};
