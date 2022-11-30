import { randomUUID } from 'crypto';
import { match } from 'node-match-path';

export const randomGuid = () => {
  return randomUUID();
};

export declare type UrlMatchPath = RegExp | string;
export interface UrlMatch {
  didMatch: boolean;
  params: Record<string, string> | null;
}

export const matchUrl = (path: UrlMatchPath, url: string): UrlMatch => {
  const matchResult = match(path, url);
  return {
    didMatch: matchResult.matches,
    params: matchResult.params,
  };
};
