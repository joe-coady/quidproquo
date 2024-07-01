import { useState, useEffect } from 'react';

import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

// import React from 'react';
// import ReactDOM from 'react-dom';
import { FederatedAddon } from './FederatedAddon';
import { getFederationManifestUrl } from './LogViewer/logic';
import { useAuthAccessToken } from 'quidproquo-web-react';
// import packageJson from '../package.json';

// init({
//   name: '@quidproquo/admin',
//   remotes: [],
//   shared: {
//     react: {
//       version: '18.3.1',
//       scope: 'default',
//       lib: () => React,
//       shareConfig: {
//         singleton: true,
//         requiredVersion: packageJson.dependencies.react,
//       },
//     },
//     'react-dom': {
//       version: '18.3.1',
//       scope: 'default',
//       lib: () => ReactDOM,
//       shareConfig: {
//         singleton: true,
//         requiredVersion: packageJson.dependencies['react-dom'],
//       },
//     },
//   },
// });

export function useFederatedAddon(appName: string): FederatedAddon[] {
  const [federatedAddons, setFederatedAddons] = useState<FederatedAddon[]>([]);
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    const doAsyncWork = async () => {
      const manifestUrl = await getFederationManifestUrl(accessToken);

      // Update the remote
      registerRemotes(
        [
          {
            name: appName,
            entry: manifestUrl,
          },
        ],
        { force: true },
      );

      // Load the remote
      const remote = await loadRemote<any>(`${appName}/qpqAdminAddon`, {
        from: 'runtime',
      });

      if (remote && typeof remote === 'object') {
        const allAddons = Object.values(remote)
          .filter((possibleAddon: any) => typeof possibleAddon === 'object')
          .filter((possibleAddon: any) => (possibleAddon as FederatedAddon).isQpqAdminFederatedAddon);

        setFederatedAddons(allAddons as FederatedAddon[]);
      }
    };

    doAsyncWork().catch((e) => {
      console.log(e);
      console.log('Unable to federate modules in');
    });
  }, [appName]);

  return federatedAddons;
}
