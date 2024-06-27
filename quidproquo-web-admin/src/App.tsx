import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { LogViewer } from './LogViewer';
import { Auth } from './Auth/Auth';
import { LoadingProvider } from './view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { WebsocketProvider } from 'quidproquo-web-react';
import { getWsBaseUrl } from './logic/platform/getApiBaseUrl';
import { WebSocketAuthProvider } from './WebSocketAuthProvider';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LoadingProvider>
          <Auth>
            <WebsocketProvider wsUrl={getWsBaseUrl()}>
              <WebSocketAuthProvider>
                <LogViewer />
              </WebSocketAuthProvider>
            </WebsocketProvider>
          </Auth>
        </LoadingProvider>
      </ThemeProvider>
    </Router>
  );
};
