export const getBaseUrlFromAdminWebHost = () => {
  const [_service, ...domain] = window.location.host.split('.');

  return window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//api.${domain.join('.')}`
    : `https://api.development.quidproquojs.com`;
};
