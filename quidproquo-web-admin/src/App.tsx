import { Admin } from './Admin';
import { LoadingProvider } from './view';

export const App = () => {
  return (
    <LoadingProvider>
      <Admin />
    </LoadingProvider>
  );
};
