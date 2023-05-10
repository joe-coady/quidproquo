import { useContext } from 'react';

import { LoadingApi } from '../types';
import { LoadingApiContext } from '../private';

export const useLoadingApi = (): LoadingApi => {
  const loadingApi = useContext(LoadingApiContext);

  return loadingApi;
};
