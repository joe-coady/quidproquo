import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import { defineWebsocket, QpqWebSocketEventProcessors } from './websocket';

const eventProcessors: QpqWebSocketEventProcessors = {
  onConnect: '/src/ws/connect::onConnect',
};

describe('defineWebsocket', () => {
  it('builds a WebSocket setting keyed by subdomain.rootDomain with defaults', () => {
    expect(defineWebsocket('api', 'example.com', eventProcessors)).toEqual({
      configSettingType: QPQWebServerConfigSettingType.WebSocket,
      uniqueKey: 'api.example.com',
      apiSubdomain: 'api',
      rootDomain: 'example.com',
      eventProcessors,
      onRootDomain: false,
      apiName: 'api',
      deprecated: false,
      cloudflareApiKeySecretName: undefined,
      owner: undefined,
    });
  });

  it('honours the advanced options', () => {
    const setting = defineWebsocket('ws', 'example.com', eventProcessors, {
      onRootDomain: true,
      apiName: 'realtime',
      deprecated: true,
      owner: { module: 'chat', websocketApiName: 'shared' },
    });

    expect(setting.onRootDomain).toBe(true);
    expect(setting.apiName).toBe('realtime');
    expect(setting.deprecated).toBe(true);
    expect(setting.owner).toEqual({ module: 'chat', websocketApiName: 'shared', resourceNameOverride: 'shared' });
  });
});
