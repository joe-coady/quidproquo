import { BaseUrlProvider, BaseUrlResolvers, WebsocketProvider } from 'quidproquo-web-react';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Auth } from './Auth/Auth';
import { LogViewer } from './LogViewer';
import { LoadingProvider } from './view';
import { WebSocketAuthProvider } from './WebSocketAuthProvider';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export type AppProps = {
  urlResolvers: BaseUrlResolvers;
};

export const App: React.FC<AppProps> = ({ urlResolvers }) => {
  return (
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
  );
};
