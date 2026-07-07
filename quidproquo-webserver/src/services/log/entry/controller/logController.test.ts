import { ConfigActionType, ErrorTypeEnum, FileActionType, KeyValueStoreActionType, runStory, StoryError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { HTTPEvent } from '../../../../types';
import { downloadUrl, getChildren, getLog, getServiceNames } from './logController';

const event = {} as HTTPEvent;

describe('getLog', () => {
  it('returns the correlation log as a json response', () => {
    const log = { correlation: 'c1' };

    const response = runStory(getLog(event, { correlationId: 'c1' }), {
      [KeyValueStoreActionType.Query]: { items: [log] },
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body!)).toEqual(log);
  });

  it('throws a NotFound error when the log is missing', () => {
    const run = () =>
      runStory(getLog(event, { correlationId: 'missing' }), {
        [KeyValueStoreActionType.Query]: { items: [] },
      });

    expect(run).toThrow(StoryError);
    try {
      run();
    } catch (e) {
      expect((e as StoryError).errorType).toBe(ErrorTypeEnum.NotFound);
    }
  });
});

describe('getServiceNames', () => {
  it('returns the configured service names global', () => {
    const serviceNames = ['auth', 'log'];

    const response = runStory(getServiceNames(event), {
      [ConfigActionType.GetGlobal]: serviceNames,
    });

    expect(JSON.parse(response.body!)).toEqual(serviceNames);
  });
});

describe('getChildren', () => {
  it('returns the logs sharing the from-correlation', () => {
    const children = { items: [{ correlation: 'c2' }] };

    const response = runStory(getChildren(event, { fromCorrelation: 'c1' }), {
      [KeyValueStoreActionType.Query]: children,
    });

    expect(JSON.parse(response.body!)).toEqual(children);
  });
});

describe('downloadUrl', () => {
  it('returns a signed url when the log is not in cold storage', () => {
    const response = runStory(downloadUrl(event, { correlationId: 'c1' }), {
      [FileActionType.IsColdStorage]: false,
      [FileActionType.GenerateTemporarySecureUrl]: 'https://signed.example/c1.json',
    });

    expect(JSON.parse(response.body!)).toEqual({ url: 'https://signed.example/c1.json', isColdStorage: false });
  });

  it('reports cold storage without a url', () => {
    const response = runStory(downloadUrl(event, { correlationId: 'c1' }), {
      [FileActionType.IsColdStorage]: true,
    });

    expect(JSON.parse(response.body!)).toEqual({ url: '', isColdStorage: true });
  });
});
