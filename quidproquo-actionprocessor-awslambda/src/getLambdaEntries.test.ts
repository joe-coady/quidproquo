import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { entryNames, getLambdaEntries } from './getLambdaEntries';

describe('getLambdaEntries', () => {
  it('maps every entry name to a path under ./lambdas', () => {
    const entries = getLambdaEntries();

    expect(Object.keys(entries).sort()).toEqual([...entryNames].sort());
    for (const name of entryNames) {
      expect(entries[name]).toContain(`lambdas/${name}`);
    }
  });

  it('exposes the api gateway and sqs entry points', () => {
    expect(entryNames).toContain('apiGatewayEventHandler');
    expect(entryNames).toContain('sqsEvent_queueEvent');
  });

  // Bundlers resolve these paths at deploy time; a rename in ./lambdas that misses
  // this list would only surface as a broken deploy build.
  it('has a lambda source file for every entry name', () => {
    for (const name of entryNames) {
      expect(existsSync(path.join(__dirname, 'lambdas', `${name}.ts`)), `missing lambda source for entry ${name}`).toBe(true);
    }
  });
});
