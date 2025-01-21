import { QueueMessage } from 'quidproquo-core';

import { QueueEvent } from '../../../types';

export type WebSocketQueueEvent<EventType, Payload> = QueueEvent<
  {
    type: EventType;
  } & QueueMessage<Payload>
>;
