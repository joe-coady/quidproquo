import { Construct } from 'constructs';
import { CertificateQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';

export interface QpqWebserverCertificateConstructProps extends QpqConstructBlockProps {
  certificateConfig: CertificateQPQWebServerConfigSetting;
}

export class QpqWebserverCertificateConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverCertificateConstructProps) {
    super(scope, id, props);

    new DnsValidatedCertificate(this, 'cert', {
      domain: {
        onRootDomain: props.certificateConfig.onRootDomain,
        subDomainNames: props.certificateConfig.subdomain ? [props.certificateConfig.subdomain] : undefined,
        rootDomain: props.certificateConfig.rootDomain,
      },

      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });
  }
}
