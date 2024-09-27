import { DependencyList, useEffect } from 'react';

export const useAsyncEffect = (effect: (isMounted: () => boolean) => Promise<void | (() => void)>, deps?: DependencyList): void => {
  useEffect(() => {
    const mountStatus = { mounted: true };

    const runEffect = async () => {
      try {
        return await effect(() => mountStatus.mounted);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in useAsyncEffect:', error);
      }
    };

    const result = runEffect();

    return () => {
      mountStatus.mounted = false;

      result.then((callback) => {
        if (callback) {
          callback();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
