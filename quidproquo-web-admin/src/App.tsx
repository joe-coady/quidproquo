import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { LogViewer } from './LogViewer';
import { Auth } from './Auth/Auth';
import { LoadingProvider } from './view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { WebsocketProvider, BaseUrlProvider, BaseUrlResolvers } from 'quidproquo-web-react';
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
