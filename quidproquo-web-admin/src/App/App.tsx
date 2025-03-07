import { BaseUrlProvider, BaseUrlResolvers, QpqContextProvider, WebsocketProvider } from 'quidproquo-web-react';

import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Auth } from '../Auth/Auth';
import { LogViewer } from '../LogViewer';
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
};

export const App: React.FC<AppProps> = ({ urlResolvers }) => {
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
                <WebsocketProvider wsUrl={urlResolvers.getWsUrl()}>
                  <WebSocketAuthProvider>
                    <LogViewer />
                  </WebSocketAuthProvider>
                </WebsocketProvider>
              </Auth>
            </LoadingProvider>
          </ThemeProvider>
        </BaseUrlProvider>
      </Router>
    </QpqContextProvider>
  );
};
