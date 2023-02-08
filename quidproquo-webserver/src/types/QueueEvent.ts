export interface QueueEventParams<T = any> {
  type: string;
  payload: T;
}

export type QueueEventResponse = boolean;
