export type HTTPMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'PATCH';

export interface HTTPEventParams<T> {
  path: string;
  query: { [key: string]: undefined | string | string[] };
  body: T;
  headers: { [key: string]: undefined | string };
  method: HTTPMethod;
  correlation: string;
}
