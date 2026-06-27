import { buildTestQpqConfig } from 'quidproquo-core';
import { DnsActionType } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { getWebserverActionProcessor } from './index';

describe('getWebserverActionProcessor', () => {
  it('exposes the dns action processors', async () => {
    const apl = await getWebserverActionProcessor(buildTestQpqConfig(), async () => null);

    expect(typeof apl[DnsActionType.List]).toBe('function');
  });
});
