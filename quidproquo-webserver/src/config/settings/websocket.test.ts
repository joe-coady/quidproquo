import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import { defineWebsocket, QpqWebSocketEventProcessors } from './websocket';

const eventProcessors: QpqWebSocketEventProcessors = {
  onConnect: '/src/ws/connect::onConnect',
};

describe('defineWebsocket', () => {
  // The uniqueKey is deliberately domain-FREE (apiSubdomain only): it becomes the CDK
  // construct id and therefore the CloudFormation logical id, while every physical resource
  // the setting creates is named from app/service/environment. A domain-derived key meant a
  // domain rename changed the logical ids over unchanged physical names, deadlocking the
  // inf/api stacks on "already exists" — see websocket.ts.
  it('builds a WebSocket setting keyed by apiSubdomain with defaults', () => {
    expect(defineWebsocket('api', 'example.com', eventProcessors)).toEqual({
      configSettingType: QPQWebServerConfigSettingType.WebSocket,
      uniqueKey: 'api',
      apiSubdomain: 'api',
      rootDomain: 'example.com',
      eventProcessors,
      onRootDomain: false,
      apiName: 'api',
      deprecated: false,
      cloudflareApiKeySecretName: undefined,
      maxConcurrentExecutions: undefined,
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
