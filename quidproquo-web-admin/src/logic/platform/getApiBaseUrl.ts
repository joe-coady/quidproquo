export const getApiBaseUrl = () => {
  const [service, ...domain] = window.location.host.split('.').slice(1);

  return window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//api.${domain.join('.')}/${service}`
    : `http://localhost:8080/api/admin`;
};

export const getWsBaseUrl = () => {
  const [service, ...domain] = window.location.host.split('.').slice(1);

  return window.location.hostname !== 'localhost'
    ? `wss//wsadmin.${domain.join('.')}/${service}`
    : `ws://localhost:8080/ws/admin`;
};
