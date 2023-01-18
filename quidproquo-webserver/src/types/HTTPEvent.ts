import { HTTPMethod } from 'quidproquo-core';

export interface HttpEventHeaders {
  [key: string]: undefined | string;
}

export interface HTTPEventParams<T = string> {
  path: string;
  query: { [key: string]: undefined | string | string[] };
  body: T;
  headers: HttpEventHeaders;
  method: HTTPMethod;
  correlation: string;
  sourceIp: string;
  isBase64Encoded: boolean;
}

export interface HTTPEventResponse<T = string> {
  status: number;
  body?: T;
  headers?: HttpEventHeaders;
  isBase64Encoded: boolean;
}
