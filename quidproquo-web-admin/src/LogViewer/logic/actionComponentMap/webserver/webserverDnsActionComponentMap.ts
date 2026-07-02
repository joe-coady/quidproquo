import { DnsActionType } from 'quidproquo-webserver';

const webserverDnsActionComponentMap: Record<string, string[]> = {
  [DnsActionType.List]: ['askDnsList'],
};

export default webserverDnsActionComponentMap;
