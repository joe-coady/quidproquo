import { ErrorTypeEnum, runStory, StoryError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { WebsocketEvent } from '../types';
import { askFromJsonWebsocketEventRequest, fromJsonWebsocketEventRequest } from './websocketEventUtils';

const buildEvent = (body?: string): WebsocketEvent<string> => ({ body }) as WebsocketEvent<string>;

describe('fromJsonWebsocketEventRequest', () => {
  it('parses the JSON body', () => {
    expect(fromJsonWebsocketEventRequest(buildEvent('{"a":1}'))).toEqual({ a: 1 });
  });

  it('throws when the body is missing', () => {
    expect(() => fromJsonWebsocketEventRequest(buildEvent())).toThrow('websocketJsonEvent.body is undefined');
  });
});

describe('askFromJsonWebsocketEventRequest', () => {
  it('returns the parsed body', () => {
    expect(runStory(askFromJsonWebsocketEventRequest(buildEvent('{"a":1}')))).toEqual({ a: 1 });
  });

  it('throws an Invalid error when the body is missing', () => {
    try {
      runStory(askFromJsonWebsocketEventRequest(buildEvent()));
      throw new Error('expected a StoryError');
    } catch (e) {
      expect((e as StoryError).errorType).toBe(ErrorTypeEnum.Invalid);
    }
  });
});
