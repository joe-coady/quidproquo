import { ApiQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { SubdomainName } from '../../../basic/SubdomainName';

export interface DomainQpqWebserverApiConstructProps extends QpqConstructBlockProps {
  apiConfig: ApiQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class DomainQpqWebserverApiConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: DomainQpqWebserverApiConstructProps) {
    super(scope, id, props);

    // api.service.domain.com or api.domain.com
    const apexDomain = qpqWebServerUtils.resolveDomainRoot(props.apiConfig.rootDomain, props.qpqConfig);

    // Create subdomain (SubdomainName looks up the deploy-region cert from SSM internally)
    new SubdomainName(this, 'subdomain', {
      apexDomain,
      rootDomain: props.apiConfig.rootDomain,
      subdomain: props.apiConfig.apiSubdomain,
      qpqConfig: props.qpqConfig,
    });
  }
}
