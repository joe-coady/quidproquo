import { LogViewer } from './LogViewer';
import { Auth } from './Auth/Auth';
import { LoadingProvider } from './view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LoadingProvider>
        <Auth>
          <LogViewer />
        </Auth>
      </LoadingProvider>
    </ThemeProvider>
  );
};
