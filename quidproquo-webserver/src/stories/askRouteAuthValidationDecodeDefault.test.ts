import { runStory, throwsError, UserDirectoryActionType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { HTTPEvent } from '../types/HTTPEvent';
import { askRouteAuthValidationDecodeDefault } from './askRouteAuthValidationDecodeDefault';

const buildPayload = (headers: Record<string, string>, userDirectoryName?: string) => ({
  event: { headers } as unknown as HTTPEvent,
  routeAuthSettings: { userDirectoryName },
  ignoreExpiration: false,
});

describe('askRouteAuthValidationDecodeDefault', () => {
  it('returns null when there is no user directory', () => {
    expect(runStory(askRouteAuthValidationDecodeDefault(buildPayload({})))).toBeNull();
  });

  it('returns null when there is no authorization header', () => {
    expect(runStory(askRouteAuthValidationDecodeDefault(buildPayload({}, 'users')))).toBeNull();
  });

  it('returns null when the authorization scheme is not Bearer', () => {
    expect(runStory(askRouteAuthValidationDecodeDefault(buildPayload({ Authorization: 'Basic abc' }, 'users')))).toBeNull();
  });

  it('returns the decoded token on success', () => {
    const decoded = { wasValid: true, userId: 'u1' };
    const result = runStory(askRouteAuthValidationDecodeDefault(buildPayload({ Authorization: 'Bearer token' }, 'users')), {
      [UserDirectoryActionType.DecodeAccessToken]: decoded,
    });

    expect(result).toEqual(decoded);
  });

  it('returns null when decoding fails', () => {
    const result = runStory(askRouteAuthValidationDecodeDefault(buildPayload({ Authorization: 'Bearer token' }, 'users')), {
      [UserDirectoryActionType.DecodeAccessToken]: throwsError('SomeError', 'bad token'),
    });

    expect(result).toBeNull();
  });
});
