import { BaseUrlProvider, BaseUrlResolvers, QpqContextProvider, WebsocketProvider } from 'quidproquo-web-react';

import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { AdminAppProvider } from '../adminApp';
import { Auth } from '../Auth/Auth';
import { MainLayout } from '../components';
import { LoadFederatedAddons } from '../FederatedAddon';
import { FederatedAddonProvider } from '../FederatedAddonProvider';
import { BaseUrls, baseUrlsContext } from '../platformLogic/contexts';
import { LoadingProvider } from '../view';
import { WebSocketAuthProvider } from '../WebSocketAuthProvider';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export type AppProps = {
  urlResolvers: BaseUrlResolvers;

  // Optional hook for the host application to federate / load admin addons.
  // When omitted, no addons are loaded.
  loadAddons?: LoadFederatedAddons;
};

export const App: React.FC<AppProps> = ({ urlResolvers, loadAddons }) => {
  const baseUrls: BaseUrls = useMemo(
    () => ({
      api: urlResolvers.getApiUrl(),
      ws: urlResolvers.getWsUrl(),
    }),
    [urlResolvers],
  );

  return (
    <QpqContextProvider contextIdentifier={baseUrlsContext} value={baseUrls}>
      <Router>
        <BaseUrlProvider urlResolvers={urlResolvers}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <LoadingProvider>
              <Auth>
                <AdminAppProvider>
                  <WebsocketProvider wsUrl={urlResolvers.getWsUrl()}>
                    <WebSocketAuthProvider>
                      <FederatedAddonProvider loadAddons={loadAddons}>
                        <MainLayout />
                      </FederatedAddonProvider>
                    </WebSocketAuthProvider>
                  </WebsocketProvider>
                </AdminAppProvider>
              </Auth>
            </LoadingProvider>
          </ThemeProvider>
        </BaseUrlProvider>
      </Router>
    </QpqContextProvider>
  );
};
