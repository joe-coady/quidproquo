export enum NetworkActionType {
  Request = '@quidproquo-core/Network/Request',
}

export type HTTPMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'PATCH';

export type ResponseType = 'binary' | 'json';

export interface HTTPRequestOptions<T> {
  basePath?: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: T;
  responseType?: ResponseType;
}

export interface HTTPNetworkResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
