import { useAuthAccessToken, useBaseUrlResolvers } from 'quidproquo-web-react';

import { useEffect, useState } from 'react';

import { FederatedAddon } from './FederatedAddon';
import { useLoadFederatedAddons } from './FederatedAddonProvider';

export function useFederatedAddon(): {
  addons: FederatedAddon[];
  loading: boolean;
} {
  const [federatedAddons, setFederatedAddons] = useState<FederatedAddon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const accessToken = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();
  const loadAddons = useLoadFederatedAddons();

  useEffect(() => {
    const doAsyncWork = async () => {
      setLoading(true);

      const addons = await loadAddons({ baseUrlResolvers, accessToken });

      setFederatedAddons(addons);
    };

    doAsyncWork()
      .catch((e) => {
        console.log(e);
        console.log('Unable to federate modules in');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    addons: federatedAddons,
    loading,
  };
}
