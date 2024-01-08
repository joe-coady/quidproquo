import { CertificateQPQWebServerConfigSetting } from 'quidproquo-webserver';

// import { CloudflareDnsRecord } from '../../../basic/CloudflareDnsRecord';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Construct } from 'constructs';

export interface QpqWebserverCertificateConstructProps extends QpqConstructBlockProps {
  certificateConfig: CertificateQPQWebServerConfigSetting;
}

export class QpqWebserverCertificateConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverCertificateConstructProps) {
    super(scope, id, props);

    new DnsValidatedCertificate(this, 'cert', {
      onRootDomain: props.certificateConfig.onRootDomain,
      subdomain: props.certificateConfig.subdomain,

      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });

    // TODO: Add cloudflare dns record
    // if (props.certificateConfig.cloudflareApiKeySecretName) {
    //   new CloudflareDnsRecord(this, 'certDns', {
    //     awsAccountId: props.awsAccountId,
    //     buildPath: qpqWebServerUtils.getCertificateSeoFullPath(
    //       props.qpqConfig,
    //       props.certificateConfig,
    //     ),
    //     qpqConfig: props.qpqConfig,

    //     // certificateArn: dnsRecord.certificate.certificateArn,
    //     certificateDomain: dnsRecord.deployDomain,
    //     dnsEntries: {},
    //     apiSecretName: props.certificateConfig.cloudflareApiKeySecretName,
    //   });
    // }
  }
}
