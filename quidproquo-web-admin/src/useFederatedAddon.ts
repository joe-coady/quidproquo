import { useAuthAccessToken, useBaseUrlResolvers } from 'quidproquo-web-react';

import { useEffect,useState } from 'react';
import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import { getFederationManifest } from './LogViewer/logic';
import { FederatedAddon } from './FederatedAddon';

export function useFederatedAddon(): {
  addons: FederatedAddon[];
  loading: boolean;
} {
  const [federatedAddons, setFederatedAddons] = useState<FederatedAddon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const accessToken = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();

  useEffect(() => {
    const doAsyncWork = async () => {
      setLoading(true);

      const manifestUrl = `${baseUrlResolvers.getMFManifestUrl()}/mf-manifest.json`;

      console.log(`manifestUrl: [${manifestUrl}]`);
      if (!manifestUrl) {
        console.log(`Missing manifest Url`);
        return;
      }

      console.log(`Reading manifest: [${manifestUrl}]`);
      const manifest = await getFederationManifest(baseUrlResolvers.getApiUrl(), manifestUrl);

      if (!manifest.id) {
        console.log(`Manifest missing id`);
        return;
      }

      // Update the remote
      console.log(`Updating remote: [${manifest.id}]`);
      registerRemotes(
        [
          {
            name: manifest.id,
            entry: manifestUrl,
          },
        ],
        { force: true },
      );

      // Load the remote
      console.log(`Loading remote: [${manifest.id}]`);
      const remote = await loadRemote<any>(`${manifest.id}/shared`, {
        from: 'runtime',
      });

      if (remote && typeof remote === 'object') {
        const allAddons = Object.values(remote)
          .filter((possibleAddon: any) => typeof possibleAddon === 'object')
          .filter((possibleAddon: any) => (possibleAddon as FederatedAddon).isQpqAdminFederatedAddon);

        setFederatedAddons(allAddons as FederatedAddon[]);
      }
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
