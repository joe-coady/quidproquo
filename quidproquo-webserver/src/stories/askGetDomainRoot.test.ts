import { ConfigActionType, ErrorTypeEnum, runStory, StoryError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { DnsActionType } from '../actions/dns/DnsActionType';
import { askGetDomainRoot } from './askGetDomainRoot';

const appInfo = { environment: 'production', feature: undefined };

describe('askGetDomainRoot', () => {
  it('builds the domain root from the supplied root domain', () => {
    const result = runStory(askGetDomainRoot('example.com'), {
      [ConfigActionType.GetApplicationInfo]: appInfo,
    });

    expect(result).toBe('example.com');
  });

  it('prefixes the environment and feature when not production', () => {
    const result = runStory(askGetDomainRoot('example.com'), {
      [ConfigActionType.GetApplicationInfo]: { environment: 'staging', feature: 'beta' },
    });

    expect(result).toBe('beta.staging.example.com');
  });

  it('falls back to the first dns entry when no root domain is supplied', () => {
    const result = runStory(askGetDomainRoot(), {
      [ConfigActionType.GetApplicationInfo]: appInfo,
      [DnsActionType.List]: ['dns.example.com'],
    });

    expect(result).toBe('dns.example.com');
  });

  it('leaves a localhost domain untouched', () => {
    const result = runStory(askGetDomainRoot('localhost:3000'), {
      [ConfigActionType.GetApplicationInfo]: appInfo,
    });

    expect(result).toBe('localhost:3000');
  });

  it('throws when no domain can be resolved', () => {
    try {
      runStory(askGetDomainRoot(), {
        [ConfigActionType.GetApplicationInfo]: appInfo,
        [DnsActionType.List]: [],
      });
      throw new Error('expected a StoryError');
    } catch (e) {
      expect((e as StoryError).errorType).toBe(ErrorTypeEnum.GenericError);
    }
  });
});
