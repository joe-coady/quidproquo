import { useEffect, useState } from 'react';

export const useLogSearchEndpoints = () => {
  const [serviceLogEndpoints, setServiceLogEndpoints] = useState([]);

  useEffect(() => {
    apiRequestGet('/admin/service/log/list').then((newServiceLogEndpoints) => {
      setServiceLogEndpoints(newServiceLogEndpoints);
    });
  }, []);

  return {};
};

export default useLogManagement;
