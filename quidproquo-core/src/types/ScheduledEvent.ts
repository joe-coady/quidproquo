export interface ScheduledEventParams<T = void> {
  time: string;
  correlation: string;

  detail: T;
}
