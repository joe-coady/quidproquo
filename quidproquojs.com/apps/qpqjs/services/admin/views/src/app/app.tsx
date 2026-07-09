import { App as QpqAdminApp } from 'quidproquo-web-admin';
import { BaseUrlResolvers } from 'quidproquo-web-react';

import { QpqjsServiceEnum } from '@qpqjs/constants';

export const getApiBaseUrl = () => {
  const [_views, ...domainParts] = window.location.host.split('.');
  const domain = domainParts.join('.');

  return window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//api.${domain}/${QpqjsServiceEnum.Admin}`
    : `http://localhost:8080/api/${QpqjsServiceEnum.Admin}`;
};

export const getWsBaseUrl = () => {
  const [_views, ...domainParts] = window.location.host.split('.');
  const domain = domainParts.join('.');

  return window.location.hostname !== 'localhost'
    ? `wss://qpqadmin.${QpqjsServiceEnum.Admin}.${domain}`
    : `ws://localhost:8888/${QpqjsServiceEnum.Admin}/qpqadmin`;
};

export const getMFManifestBaseUrl = () =>
  window.location.hostname !== 'localhost'
    ? `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}`
    : `http://localhost:3082`;

const urlResolvers: BaseUrlResolvers = {
  getApiUrl: getApiBaseUrl,
  getWsUrl: getWsBaseUrl,
  getMFManifestUrl: getMFManifestBaseUrl,
};

export function App() {
  return <QpqAdminApp urlResolvers={urlResolvers} />;
}

export default App;
