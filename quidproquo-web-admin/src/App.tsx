import { LogViewer } from './LogViewer';
import { Auth } from './Auth';
import { LoadingProvider } from './view';

export const App = () => {
  return (
    <LoadingProvider>
      <Auth>
        <LogViewer />
      </Auth>
    </LoadingProvider>
  );
};
