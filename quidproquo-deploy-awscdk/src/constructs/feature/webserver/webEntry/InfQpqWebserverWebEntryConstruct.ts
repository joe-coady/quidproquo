import { WebEntryQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Construct } from 'constructs';

import { ServiceDomainConstruct } from '../../../basic';

export interface InfQpqWebserverWebEntryConstructProps extends QpqConstructBlockProps {
  webEntryConfigs: WebEntryQPQWebServerConfigSetting[];
}

export class InfQpqWebserverWebEntryConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: InfQpqWebserverWebEntryConstructProps) {
    super(scope, id, props);

    const rootDomains = props.webEntryConfigs
      .filter((we) => !we.domain.onRootDomain)
      .map((we) => we.domain.rootDomain);

    for (const rootDomain of rootDomains) {
      new ServiceDomainConstruct(this, `domain-${rootDomain}`, {
        awsAccountId: props.awsAccountId,
        qpqConfig: props.qpqConfig,
        rootDomain,
      });
    }
  }
}
