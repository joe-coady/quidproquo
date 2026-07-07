import { ServiceActionType } from 'quidproquo-webserver';

const webserverServiceActionComponentMap: Record<string, string[]> = {
  [ServiceActionType.Request]: ['askServiceRequest', 'serviceName', 'method', 'payload'],
};

export default webserverServiceActionComponentMap;
