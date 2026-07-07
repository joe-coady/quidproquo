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
});
