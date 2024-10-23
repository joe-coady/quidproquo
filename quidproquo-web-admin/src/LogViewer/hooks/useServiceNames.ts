import { useAuthAccessToken, useBaseUrlResolvers } from 'quidproquo-web-react';

import { useEffect, useMemo,useState } from 'react';

import { getServiceNames } from '../logic';

type AutoCompleteOption = {
  label: string;
  value: string;
};

export const useServiceNames = (): AutoCompleteOption[] => {
  const [serviceNames, setServiceNames] = useState<string[]>(['All']);
  const accessToken = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();

  useEffect(() => {
    const fetchData = async () => {
      const updatedServiceNames = await getServiceNames(baseUrlResolvers.getApiUrl(), accessToken);

      setServiceNames(updatedServiceNames);
    };

    fetchData();
  }, []);

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
