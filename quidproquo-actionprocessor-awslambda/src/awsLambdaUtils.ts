import { randomUUID } from 'crypto';
import { match } from 'node-match-path';

export const randomGuid = () => {
  return randomUUID();
};

export declare type UrlMatchPath = RegExp | string;
export interface UrlMatch {
  matches: boolean;
  params: Record<string, string> | null;
}

export const matchUrl = (path: UrlMatchPath, url: string): UrlMatch => {
  return match(path, url);
};
