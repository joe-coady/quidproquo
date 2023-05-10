import { useState, useEffect } from 'react';

import { usePlatformApiGet } from '../../view';

export const useServiceLogEndpoints = (): string[] => {
  const [serviceLogEndpoints, setServiceLogEndpoints] = useState<string[]>([]);
  const loadServiceList = usePlatformApiGet<string[]>('/admin/service/log/list');

  useEffect(() => {
    loadServiceList().then((newServiceLogEndpoints) => {
      setServiceLogEndpoints(newServiceLogEndpoints);
    });
  }, []);

  return serviceLogEndpoints;
};
