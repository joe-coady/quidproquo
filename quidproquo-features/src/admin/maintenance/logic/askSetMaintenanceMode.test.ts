import { ConfigActionType, KeyValueStoreActionType, runStory } from 'quidproquo-core';
import { WebsocketActionType } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { WebSocketQueueMaintenanceLevel } from '../../../webSocketQueue/types/serverMessages/WebSocketQueueServerEventMessageMaintenance';
import { WebSocketQueueServerMessageEventType } from '../../../webSocketQueue/types/serverMessages/WebSocketQueueServerMessageEventType';
import { askSetMaintenanceMode } from './askSetMaintenanceMode';

const maintenance = {
  active: true,
  level: WebSocketQueueMaintenanceLevel.High,
  message: 'The site is undergoing a scheduled update',
};

describe('askSetMaintenanceMode', () => {
  it('broadcasts the maintenance message on the configured application websocket', () => {
    const sends: any[] = [];

    runStory(askSetMaintenanceMode(maintenance), {
      [ConfigActionType.GetGlobal]: 'app-ws',
      [KeyValueStoreActionType.Scan]: { items: [{ id: 'a' }, { id: 'b' }] },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload);
        return undefined;
      },
    });

    expect(sends.map((send) => send.websocketApiName)).toEqual(['app-ws', 'app-ws']);
    expect(sends[0].payload).toMatchObject({
      type: WebSocketQueueServerMessageEventType.Maintenance,
      payload: maintenance,
    });
  });

  it('throws when no maintenance websocket api is configured', () => {
    expect(() =>
      runStory(askSetMaintenanceMode(maintenance), {
        [ConfigActionType.GetGlobal]: '',
      }),
    ).toThrow(/No maintenance websocket api configured/);
  });
});
