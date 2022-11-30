export interface HTTPEventParams<T> {
  path: string;
  query: { [key: string]: undefined | string | string[] };
  body: T;
  headers: { [key: string]: undefined | string };
  method: 'GET' | 'POST';
  correlation: string;
}
