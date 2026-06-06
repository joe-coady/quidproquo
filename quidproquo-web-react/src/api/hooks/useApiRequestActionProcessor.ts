import { createApiRequestActionProcessor } from 'quidproquo-actionprocessor-web';
import { ActionProcessorListResolver } from 'quidproquo-core';

import { useMemo, useRef } from 'react';

import { useAuthAccessToken } from '../../auth/hooks';
import { useBaseUrlResolvers } from '../../baseUrl/hooks';

export type UseApiRequestActionProcessorOptions = {
  resolveServiceBaseUrl?: (service: string) => string;
};

export const useApiRequestActionProcessor = (options?: UseApiRequestActionProcessorOptions): ActionProcessorListResolver => {
  const accessToken = useAuthAccessToken();
  const { getApiUrl } = useBaseUrlResolvers();

  // Hold the token in a ref so the processor closure always reads the current value.
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  return useMemo(
    () =>
      createApiRequestActionProcessor({
        getHeaders: (): Record<string, string> => (tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        resolveServiceBaseUrl: options?.resolveServiceBaseUrl ?? (() => getApiUrl()),
      }),
    [options?.resolveServiceBaseUrl, getApiUrl],
  );
};
