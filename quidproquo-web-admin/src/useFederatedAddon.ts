import { useState, useEffect } from 'react';

import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import { FederatedAddon } from './FederatedAddon';
import { getFederationManifest, getFederationManifestUrl } from './LogViewer/logic';
import { useAuthAccessToken } from 'quidproquo-web-react';

export function useFederatedAddon(): {
  addons: FederatedAddon[];
  loading: boolean;
} {
  const [federatedAddons, setFederatedAddons] = useState<FederatedAddon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    const doAsyncWork = async () => {
      setLoading(true);

      const manifestUrl = await getFederationManifestUrl(accessToken);

      console.log(`manifestUrl: [${manifestUrl}]`);
      if (!manifestUrl) {
        console.log(`Missing manifest Url`);
        return;
      }

      console.log(`Reading manifest: [${manifestUrl}]`);
      const manifest = await getFederationManifest(manifestUrl);

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
      const remote = await loadRemote<any>(`${manifest.id}/qpqAdminAddon`, {
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
