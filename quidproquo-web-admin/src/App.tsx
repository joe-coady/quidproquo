import { LogViewer } from './LogViewer';
import { Auth } from './Auth/Auth';
import { LoadingProvider } from './view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App = () => {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LoadingProvider>
          <Auth>
            <LogViewer />
          </Auth>
        </LoadingProvider>
      </ThemeProvider>
    </Router>
  );
};
