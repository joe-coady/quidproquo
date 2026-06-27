import { buildTestQpqConfig, resolveActionResult } from 'quidproquo-core';
import { defineDns, DnsActionType } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { getDnsListActionProcessor } from './getDnsListActionProcessor';

describe('getDnsListActionProcessor', () => {
  it('returns the dnsBase of every configured dns setting', async () => {
    const qpqConfig = buildTestQpqConfig([defineDns('example.com'), defineDns('api.example.com')]);
    const processor = (await getDnsListActionProcessor(qpqConfig, async () => null))[DnsActionType.List] as (p: any, ...rest: any[]) => Promise<any>;

    const result = await processor(undefined, undefined as any);

    expect(resolveActionResult(result)).toEqual(['example.com', 'api.example.com']);
  });

  it('returns an empty list when no dns settings are configured', async () => {
    const processor = (await getDnsListActionProcessor(buildTestQpqConfig(), async () => null))[DnsActionType.List] as (p: any, ...rest: any[]) => Promise<any>;

    const result = await processor(undefined, undefined as any);

    expect(resolveActionResult(result)).toEqual([]);
  });
});
