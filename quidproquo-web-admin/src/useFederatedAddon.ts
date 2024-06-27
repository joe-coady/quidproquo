import { useState, useEffect } from 'react';

import { init, loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import { apiRequestGet } from './logic';

import React from 'react';
import ReactDOM from 'react-dom';
import { FederatedAddon } from './FederatedAddon';

init({
  name: '@quidproquo/admin',
  remotes: [],
  shared: {
    react: {
      version: '18.2.0',
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: '^18.2.0',
      },
    },
    'react-dom': {
      version: '18.2.0',
      scope: 'default',
      lib: () => ReactDOM,
      shareConfig: {
        singleton: true,
        requiredVersion: '^18.2.0',
      },
    },
  },
});

export function useFederatedAddon(appName: string): FederatedAddon[] {
  const [federatedAddons, setFederatedAddons] = useState<FederatedAddon[]>([]);

  useEffect(() => {
    const doAsyncWork = async () => {
      // Get the manifest url from the dev server
      // const url = await apiRequestGet<{
      //   location: string;
      // }>('http://localhost:8080/mf-manifest-location.json');

      const url = {
        location: 'http://localhost:7000/mf-manifest.json',
      };

      // Update the remote
      registerRemotes(
        [
          {
            name: appName,
            entry: url.location,
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
