import { join } from 'upath';

export function joinPaths(...parts: string[]): string {
  return join(...parts);
}
