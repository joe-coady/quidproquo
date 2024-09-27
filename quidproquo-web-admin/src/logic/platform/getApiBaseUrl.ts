export const getApiBaseUrl = () => {
  const [service, ...domain] = window.location.host.split('.').slice(1);

  return window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//api.${domain.join('.')}/${service}`
    : `https://api.joecoady.development.kitted.app/admin`;
};

export const getWsBaseUrl = () => {
  const [service, ...domain] = window.location.host.split('.').slice(1);

  return window.location.hostname !== 'localhost'
    ? `wss://wsadmin.${service}.${domain.join('.')}`
    : `wss://wsadmin.admin.joecoady.development.kitted.app`;
};
