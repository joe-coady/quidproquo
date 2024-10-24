import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { ServiceDomainConstruct } from './ServiceDomain';

export interface InfQpqWebserverServiceDomainsConstructProps extends QpqConstructBlockProps {}

export class InfQpqWebserverServiceDomainsConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: InfQpqWebserverServiceDomainsConstructProps) {
    super(scope, id, props);

    const webEntryRootDomains = qpqWebServerUtils
      .getWebEntryConfigs(props.qpqConfig)
      .filter((we) => !we.domain.onRootDomain)
      .map((we) => we.domain.rootDomain);

    const domainProxyRootDomains = qpqWebServerUtils
      .getDomainProxyConfigs(props.qpqConfig)
      .filter((we) => !we.domain.onRootDomain)
      .map((we) => we.domain.rootDomain);

    const websocketRootDomains = qpqWebServerUtils
      .getOwnedWebsocketSettings(props.qpqConfig)
      .filter((we) => !we.onRootDomain)
      .map((we) => we.rootDomain);

    const uniqueRootDomains = [...new Set([...webEntryRootDomains, ...domainProxyRootDomains, ...websocketRootDomains])];

    for (const rootDomain of uniqueRootDomains) {
      new ServiceDomainConstruct(this, `domain-${rootDomain}`, {
        qpqConfig: props.qpqConfig,
        rootDomain,
      });
    }
  }
}
