import { HTTPMethod, HTTPNetworkResponse,NetworkRequestActionPayload, QPQBinaryData, ResponseType } from 'quidproquo-core';

import axios, { AxiosResponse } from 'axios';
import { extension } from 'mime-types';

const getAxiosResponseType = (responseType: ResponseType) => {
  if (responseType === 'binary') {
    return 'arraybuffer';
  }

  return 'json';
};

const transformResponse = (payload: NetworkRequestActionPayload<any>, response: AxiosResponse<any, any>): AxiosResponse<any, QPQBinaryData> => {
  if (payload.responseType === 'binary') {
    const headers = response.headers || {};
    const mimeType = headers['content-type'] || 'application/octet-stream';

    const filename = headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || `file.${extension(mimeType)}`;

    return {
      ...response,
      data: {
        base64Data: Buffer.from(response.data).toString('base64'),
        mimetype: mimeType,
        filename,
      } as QPQBinaryData,
    };
  }

  return response;
};

const axiosInstance = axios.create({
  timeout: 25000,
  headers: {
    // Fixes: https://github.com/axios/axios/issues/5346
    'Accept-Encoding': 'gzip,deflate,compress',
  },
  validateStatus: () => true,
});

const processNetworkRequestGet = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.get(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPost = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.post(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestDelete = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.delete(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestHead = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.head(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestOptions = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.options(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPut = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.put(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPatch = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.patch(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestConnect = async (payload: NetworkRequestActionPayload<any>): Promise<AxiosResponse<any, any>> => {
  throw new Error('Function not implemented.');
};

const requestMethodMap: Record<HTTPMethod, (payload: NetworkRequestActionPayload<any>) => Promise<AxiosResponse<any, any>>> = {
  GET: processNetworkRequestGet,
  POST: processNetworkRequestPost,
  DELETE: processNetworkRequestDelete,
  HEAD: processNetworkRequestHead,
  OPTIONS: processNetworkRequestOptions,
  PUT: processNetworkRequestPut,
  PATCH: processNetworkRequestPatch,
  CONNECT: processNetworkRequestConnect,
};

const convertAxiosHeadersToRecord = (headers: AxiosResponse['headers']): Record<string, string> => {
  const record: Record<string, string> = {};

  Object.keys(headers).forEach((key) => {
    record[key] = headers[key];
  });

  return record;
};

export const preformNetworkRequest = async <R>(payload: NetworkRequestActionPayload<any>): Promise<HTTPNetworkResponse<R>> => {
  const requestMethod = requestMethodMap[payload.method];

  if (!requestMethod) {
    throw new Error(`Request not implemented [payload.method]`);
  }

  try {
    const response = await requestMethod(payload);

    const httpNetworkResponse: HTTPNetworkResponse<R> = {
      headers: convertAxiosHeadersToRecord(response.headers),
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };

    return httpNetworkResponse;
  } catch (err: any) {
    console.log(err);

    const errorResponse: HTTPNetworkResponse<R> = {
      headers: {},
      status: 500,
      statusText: 'Internal Server Error',
      data: err.stack,
    };

    return errorResponse;
  }
};
