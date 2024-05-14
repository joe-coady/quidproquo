import { useAsyncLoading } from '../Loading';
import { apiRequestGet, externalRequestGet } from '../../logic';
import { AnyAsyncFunction } from '../types';
import { useAuthAccessToken } from '../../Auth/hooks';
import { useFastCallback } from 'quidproquo-web-react';

/**
 * Custom hook for making a GET request to the platform API.
 *
 * @template T - The type of the response data.
 * @param {string} path - The API path for the GET request.
 * @returns {AnyAsyncFunction<[], T>} - The asynchronous function for making the API request with loading trigger.
 */
export const usePlatformApiGet = <T>(path?: string | null): AnyAsyncFunction<[], T> => {
  const accessToken = useAuthAccessToken();

  const requestFunc = useFastCallback(async (): Promise<T> => {
    return await apiRequestGet<T>(path!, accessToken);
  });

  const requestFuncWithLoadingTrigger = useAsyncLoading(requestFunc);

  return requestFuncWithLoadingTrigger;
};

/**
 * Custom hook for making a GET request to the platform API.
 *
 * @template T - The type of the response data.
 * @param {string} path - The API path for the GET request.
 * @returns {AnyAsyncFunction<[], T>} - The asynchronous function for making the API request with loading trigger.
 */
export const useExternalApiGet = <T>(url?: string | null): AnyAsyncFunction<[], T> => {
  const requestFunc = useFastCallback(async (): Promise<T> => {
    return await externalRequestGet<T>(url!);
  });

  const requestFuncWithLoadingTrigger = useAsyncLoading(requestFunc);

  return requestFuncWithLoadingTrigger;
};
