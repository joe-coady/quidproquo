import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { RouteAuthSettings } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { RouteAuthValidationActionType } from './RouteAuthValidationActionType';
import { askRouteAuthValidationDecode } from './RouteAuthValidationDecodeActionRequester';

const event = { headers: {}, path: '/' } as unknown as HTTPEvent;
const routeAuthSettings: RouteAuthSettings = { userDirectoryName: 'users' };

describe('askRouteAuthValidationDecode', () => {
  it('yields a Decode action with the event, settings and expiration flag', () => {
    const { action } = captureRequester(askRouteAuthValidationDecode(event, routeAuthSettings, true));

    expect(action).toEqual({
      type: RouteAuthValidationActionType.Decode,
      payload: { event, routeAuthSettings, ignoreExpiration: true },
    });
  });

  it('returns the decoded token the runtime resolves', () => {
    const decoded = { userId: 'u1', username: 'user', exp: 0, userDirectory: 'users', wasValid: true };
    const { returned } = captureRequester(askRouteAuthValidationDecode(event, routeAuthSettings, false), decoded);

    expect(returned).toBe(decoded);
  });

  it('returns null when the runtime resolves no valid token', () => {
    const { returned } = captureRequester(askRouteAuthValidationDecode(event, routeAuthSettings, false), null);

    expect(returned).toBeNull();
  });
});
