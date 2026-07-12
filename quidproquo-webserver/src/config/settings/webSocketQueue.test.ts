import { QPQCoreConfigSettingType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import {
  defineWebSocketQueue,
  getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator,
  getWebSocketQueueGlobalConfigKeyForEventBusName,
  getWebSocketQueueGlobalConfigKeyForUserDirectoryName,
  getWebSocketQueueKeyValueStoreName,
} from './webSocketQueue';

describe('webSocketQueue key helpers', () => {
  it('derives stable keys from the api name', () => {
    expect(getWebSocketQueueGlobalConfigKeyForEventBusName('chat')).toBe('qpq-wsq-eb-name-chat');
    expect(getWebSocketQueueGlobalConfigKeyForUserDirectoryName('chat')).toBe('qpq-wsq-kvs-name-chat');
    expect(getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator('chat')).toBe('qpq-wsq-scope-validator-chat');
    expect(getWebSocketQueueKeyValueStoreName('chat')).toBe('qpq-wsq-chat');
  });
});

describe('defineWebSocketQueue', () => {
  it('emits three globals, a connection kvs and a websocket', () => {
    const config = defineWebSocketQueue('chat-bus', 'chat', 'example.com');
    const types = config.map((setting) => (setting as { configSettingType: string }).configSettingType);

    expect(types).toEqual([
      QPQCoreConfigSettingType.global,
      QPQCoreConfigSettingType.global,
      QPQCoreConfigSettingType.global,
      QPQCoreConfigSettingType.keyValueStore,
      QPQWebServerConfigSettingType.WebSocket,
    ]);
  });
});
