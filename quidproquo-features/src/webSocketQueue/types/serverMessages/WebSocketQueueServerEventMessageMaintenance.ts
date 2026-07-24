import { WebSocketQueueEventMessage } from '../WebSocketQueueEventMessage';
import { WebSocketQueueServerMessageEventType } from './WebSocketQueueServerMessageEventType';

export enum WebSocketQueueMaintenanceLevel {
  /** Informational — users can keep working. */
  Low = 'Low',
  /** Critical — frontends should lock the UI until maintenance ends. */
  High = 'High',
}

export type WebSocketQueueServerEventPayloadMaintenance = {
  /** True while maintenance is in progress; a false message ends it. */
  active: boolean;
  level: WebSocketQueueMaintenanceLevel;
  /** Human-readable notice to show the user. */
  message?: string;
};

export type WebSocketQueueServerEventMessageMaintenance = WebSocketQueueEventMessage<
  WebSocketQueueServerEventPayloadMaintenance,
  WebSocketQueueServerMessageEventType.Maintenance
>;
