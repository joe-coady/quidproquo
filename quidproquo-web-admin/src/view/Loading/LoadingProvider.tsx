import { LoadingContext, LoadingApiContext, useLoadingManager } from './private';

export const LoadingProvider: React.FC = ({ children }) => {
  const [isLoading, api] = useLoadingManager();

  return (
    <LoadingApiContext.Provider value={api}>
      <LoadingContext.Provider value={isLoading}>{children};</LoadingContext.Provider>
    </LoadingApiContext.Provider>
  );
};
