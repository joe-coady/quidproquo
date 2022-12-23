import {
  NetworkRequestActionProcessor,
  actionResult,
  NetworkActionType,
  HTTPMethod,
  NetworkRequestActionPayload,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import axios, { AxiosResponse } from 'axios';

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
  });

  return response;
};

const processNetworkRequestPost = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.post(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
};

const processNetworkRequestDelete = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.delete(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
};

const processNetworkRequestHead = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.head(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
};

const processNetworkRequestOptions = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.options(payload.url, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
};

const processNetworkRequestPut = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.put(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
};

const processNetworkRequestPatch = async (
  payload: NetworkRequestActionPayload<any>,
): Promise<AxiosResponse<any, any>> => {
  const response = await axiosInstance.patch(payload.url, payload.body, {
    baseURL: payload.basePath,
    headers: payload.headers,
    params: payload.params,
  });

  return response;
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
