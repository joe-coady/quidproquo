import {
  WebEntryQPQWebServerConfigSetting,
  WebSocketQPQWebServerConfigSetting,
} from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';

import { ServiceDomainConstruct } from '.';

export interface InfQpqWebserverServiceDomainsConstructProps extends QpqConstructBlockProps {
  webEntryConfigs: WebEntryQPQWebServerConfigSetting[];
  websocketConfigs: WebSocketQPQWebServerConfigSetting[];
}

export class InfQpqWebserverServiceDomainsConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: InfQpqWebserverServiceDomainsConstructProps) {
    super(scope, id, props);

    const webEntryRootDomains = props.webEntryConfigs
      .filter((we) => !we.domain.onRootDomain)
      .map((we) => we.domain.rootDomain);

    const websocketRootDomains = props.websocketConfigs
      .filter((we) => !we.onRootDomain)
      .map((we) => we.rootDomain);

    const uniqueRootDomains = [...new Set([...webEntryRootDomains, ...websocketRootDomains])];

    for (const rootDomain of uniqueRootDomains) {
      new ServiceDomainConstruct(this, `domain-${rootDomain}`, {
        awsAccountId: props.awsAccountId,
        qpqConfig: props.qpqConfig,
        rootDomain,
      });
    }
  }
}
