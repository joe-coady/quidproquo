import { HTTPMethod } from 'quidproquo-core';

export interface HttpEventHeaders {
  [key: string]: undefined | string;
}

export interface HTTPEventParams<T> {
  path: string;
  query: { [key: string]: undefined | string | string[] };
  body: T;
  headers: HttpEventHeaders;
  method: HTTPMethod;
  correlation: string;
  sourceIp: string;
}
