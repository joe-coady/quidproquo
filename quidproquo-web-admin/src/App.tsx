import { LogViewer } from './LogViewer';
import { LoadingProvider } from './view';

export const App = () => {
  return (
    <LoadingProvider>
      <LogViewer />
    </LoadingProvider>
  );
};
