import { QueueMessage } from '../actions';
import { QueueEvent } from './QueueEvent';

export enum NotifyErrorQueueEvents {
  Error = 'Error',
  Timeout = 'Timeout',
  Unknown = 'Unknown',
}

export type NotifyErrorQueueBaseEventPayload = {
  newStateInAlarm: boolean;
  newStateReason: string;

  oldStateInAlarm: boolean;
};

// Error

export type NotifyErrorQueueErrorEventPayload = NotifyErrorQueueBaseEventPayload;

export interface NotifyErrorQueueErrorEventMessage extends QueueMessage<NotifyErrorQueueErrorEventPayload> {
  type: NotifyErrorQueueEvents.Error;
}

export type NotifyErrorQueueErrorQueueEvent = QueueEvent<NotifyErrorQueueErrorEventMessage>;

// Timeout

export type NotifyErrorQueueTimeoutEventPayload = NotifyErrorQueueBaseEventPayload;

export interface NotifyErrorQueueTimeoutEventMessage extends QueueMessage<NotifyErrorQueueTimeoutEventPayload> {
  type: NotifyErrorQueueEvents.Timeout;
}

export type NotifyErrorQueueTimeoutQueueEvent = QueueEvent<NotifyErrorQueueTimeoutEventMessage>;
