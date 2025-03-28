import { ApiQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { SubdomainName } from '../../../basic/SubdomainName';

export interface BootstrapQpqWebserverApiConstructProps extends QpqConstructBlockProps {
  apiConfig: ApiQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class BootstrapQpqWebserverApiConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: BootstrapQpqWebserverApiConstructProps) {
    super(scope, id, props);

    // api.service.domain.com or api.domain.com
    const apexDomain = qpqWebServerUtils.resolveDomainRoot(props.apiConfig.rootDomain, props.qpqConfig);

    // Create subdomain
    new SubdomainName(this, 'subdomain', {
      apexDomain,
      subdomain: props.apiConfig.apiSubdomain,
      qpqConfig: props.qpqConfig,
    });
  }
}
