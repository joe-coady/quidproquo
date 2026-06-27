import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { DnsActionType } from './DnsActionType';
import { askDnsList } from './DnsListActionRequester';

describe('askDnsList', () => {
  it('yields a List action with no payload', () => {
    const { action } = captureRequester(askDnsList());

    expect(action).toEqual({ type: DnsActionType.List });
  });

  it('returns the domain list the runtime resolves', () => {
    const { returned } = captureRequester(askDnsList(), ['example.com']);

    expect(returned).toEqual(['example.com']);
  });
});
