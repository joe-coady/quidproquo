import { useState, useEffect } from 'react';

import { init, loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import { apiRequestGet } from './logic';

import React from 'react';
import ReactDOM from 'react-dom';

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

export function useFederatedFrontend<T>(appName: string): T | null {
  const [loadedModule, setLoadedModule] = useState<T | null>(null);

  useEffect(() => {
    const doAsyncWork = async () => {
      // Get the manifest url from the dev server
      const url = await apiRequestGet<{
        location: string;
      }>('http://localhost:8080/mf-manifest-location.json');

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
      const remote = await loadRemote<T>(`${appName}/add`, {
        from: 'runtime',
      });

      setLoadedModule(remote);
    };

    doAsyncWork().catch((e) => {
      console.log('Unable to federate modules in');
    });
  }, [appName]);

  return loadedModule;
}
