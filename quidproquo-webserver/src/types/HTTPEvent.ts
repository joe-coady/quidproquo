import { HTTPMethod, QPQBinaryData } from 'quidproquo-core';

export interface HttpEventHeaders {
  [key: string]: undefined | string;
}

export interface HttpEventRouteParams {
  [key: string]: string;
}

export interface HTTPEvent<T = string> {
  path: string;
  query: { [key: string]: undefined | string | string[] };
  body: T;
  headers: HttpEventHeaders;
  method: HTTPMethod;
  correlation: string;
  sourceIp: string;
  isBase64Encoded: boolean;
  files?: QPQBinaryData[];
}

export interface HTTPEventResponse<T = string> {
  status: number;
  body?: T;
  headers?: HttpEventHeaders;
  isBase64Encoded: boolean;
}
