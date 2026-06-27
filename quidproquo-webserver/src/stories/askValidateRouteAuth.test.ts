import { runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { ApiKeyValidationActionType } from '../actions/apiKeyValidation';
import { RouteAuthValidationActionType } from '../actions/routeAuthValidation';
import { HTTPEvent } from '../types/HTTPEvent';
import { askValidateRouteAuth } from './askValidateRouteAuth';

const buildEvent = (headers: Record<string, string> = {}) => ({ headers } as unknown as HTTPEvent);

describe('askValidateRouteAuth', () => {
  it('allows the request when there are no auth settings', () => {
    expect(runStory(askValidateRouteAuth({ event: buildEvent() }))).toBe(true);
  });

  it('rejects when the token decodes but is not valid', () => {
    const result = runStory(
      askValidateRouteAuth({ event: buildEvent(), routeAuthSettings: { userDirectoryName: 'users' } }),
      { [RouteAuthValidationActionType.Decode]: { wasValid: false } },
    );

    expect(result).toBe(false);
  });

  it('rejects when the token cannot be decoded', () => {
    const result = runStory(
      askValidateRouteAuth({ event: buildEvent(), routeAuthSettings: { userDirectoryName: 'users' } }),
      { [RouteAuthValidationActionType.Decode]: null },
    );

    expect(result).toBe(false);
  });

  it('rejects when an api key is required but absent', () => {
    const result = runStory(
      askValidateRouteAuth({ event: buildEvent(), routeAuthSettings: { apiKeys: [{ name: 'k1' }] } }),
    );

    expect(result).toBe(false);
  });

  it('rejects when the api key is invalid', () => {
    const result = runStory(
      askValidateRouteAuth({ event: buildEvent({ 'x-api-key': 'secret' }), routeAuthSettings: { apiKeys: [{ name: 'k1' }] } }),
      { [ApiKeyValidationActionType.Validate]: false },
    );

    expect(result).toBe(false);
  });

  it('allows the request when token and api key both validate', () => {
    const result = runStory(
      askValidateRouteAuth({
        event: buildEvent({ 'x-api-key': 'secret' }),
        routeAuthSettings: { userDirectoryName: 'users', apiKeys: [{ name: 'k1' }] },
      }),
      {
        [RouteAuthValidationActionType.Decode]: { wasValid: true },
        [ApiKeyValidationActionType.Validate]: true,
      },
    );

    expect(result).toBe(true);
  });
});
