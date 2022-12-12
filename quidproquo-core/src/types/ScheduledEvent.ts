export interface ScheduledEventParams<T> {
  time: string;
  correlation: string;

  detail: T;
}
