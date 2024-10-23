import { EventActionType, QpqRuntimeType, StoryResult } from 'quidproquo-core';

import { WebsocketEvent } from '../../../../types';

export const webSocketEventGenericTextExtractor = (storyResult: StoryResult<any>): string => {
  if (storyResult.runtimeType === QpqRuntimeType.WEBSOCKET_EVENT) {
    const transformEventParams = storyResult.history.find((h) => h.act.type === EventActionType.TransformEventParams);

    if (!transformEventParams) {
      return 'no transformEventParams';
    }

    const result = transformEventParams.res as [WebsocketEvent];
    const connectionId = result[0]?.connectionId || 'unknown';
    const ip = result[0]?.sourceIp || 'unknown';
    const event = result[0]?.eventType || 'unknown';

    return `${event} ${connectionId} ${ip}`;
  }

  return '';
};
