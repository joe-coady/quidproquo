import { useAuthAccessToken, useBaseUrlResolvers, useEffectCallback } from 'quidproquo-web-react';

import { useEffect, useMemo, useState } from 'react';

import { getServiceNames } from '../logic';

export type AutoCompleteOption = {
  label: string;
  value: string;
};

export const useServiceNames = (): AutoCompleteOption[] => {
  const [serviceNames, setServiceNames] = useState<string[]>(['All']);
  const accessToken = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();

  // Stable identity so the mount-only effect below can list it as a dependency.
  const fetchData = useEffectCallback(async () => {
    const updatedServiceNames = await getServiceNames(baseUrlResolvers.getApiUrl(), accessToken);

    setServiceNames(updatedServiceNames);
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const serviceOptions = useMemo(
    () =>
      serviceNames.map((s) => ({
        label: s
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        value: s,
      })),
    [serviceNames],
  );

  return serviceOptions;
};
