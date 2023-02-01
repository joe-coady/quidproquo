import {
  NetworkRequestActionProcessor,
  actionResult,
  NetworkActionType,
  HTTPMethod,
  NetworkRequestActionPayload,
  actionResultError,
  ErrorTypeEnum,
  ResponseType,
  QPQBinaryData,
} from 'quidproquo-core';

import { extension } from 'mime-types';

import axios, { AxiosResponse } from 'axios';

const getAxiosResponseType = (responseType: ResponseType) => {
  if (responseType === 'binary') {
    return 'arraybuffer';
  }

  return 'json';
};

const transformResponse = (
  payload: NetworkRequestActionPayload<any>,
  response: AxiosResponse<any, any>,
): AxiosResponse<any, QPQBinaryData> => {
  if (payload.responseType === 'binary') {
    const mimeType = (payload.headers || {})['content-type'] || 'application/octet-stream';

    return {
      ...response,
      data: {
        base64Data: Buffer.from(response.data).toString('base64'),
        mimetype: mimeType,

        // TODO: We could get a filename from Content-Disposition header
        filename: `file.${extension(mimeType)}`,
      } as QPQBinaryData,
    };
  }

  return response;
};

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    // Fixes: https://github.com/axios/axios/issues/5346
    'Accept-Encoding': 'gzip,deflate,compress',
  },
});

const processNetworkRequestGet = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.get(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPost = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.post(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestDelete = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.delete(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestHead = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.head(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestOptions = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.options(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPut = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.put(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestPatch = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.patch(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
    responseType: getAxiosResponseType(payload.responseType),
  });

  return transformResponse(payload, response);
};

const processNetworkRequestConnect = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  throw new Error('Function not implemented.');
};

const requestMethodMap: Record<
  HTTPMethod,
  (payload: NetworkRequestActionPayload<any>) => Promise<AxiosResponse<any, any>>
> = {
  GET: processNetworkRequestGet,
  POST: processNetworkRequestPost,
  DELETE: processNetworkRequestDelete,
  HEAD: processNetworkRequestHead,
  OPTIONS: processNetworkRequestOptions,
  PUT: processNetworkRequestPut,
  PATCH: processNetworkRequestPatch,
  CONNECT: processNetworkRequestConnect,
};

const processNetworkRequest: NetworkRequestActionProcessor<any, any> = async (payload) => {
  const requestMethod = requestMethodMap[payload.method];

  if (!requestMethod) {
    return actionResultError(ErrorTypeEnum.NotImplemented, `${payload.method}: Not implemented`);
  }

  try {
    const response = await requestMethod(payload);

    return actionResult({
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
  } catch (err: any) {
    console.log(err);
    return actionResultError(ErrorTypeEnum.GenericError, err.stack);
  }
};

export default {
  [NetworkActionType.Request]: processNetworkRequest,
};
