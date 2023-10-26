import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { custom_resources, CustomResource, aws_route53, aws_certificatemanager } from 'aws-cdk-lib';
import { Function } from './Function';
import {
  CloudflareDnsDeployEventCommon,
  CloudflareDnsEntries,
  qpqWebServerUtils,
} from 'quidproquo-webserver';
import * as qpqDeployAwsCdkUtils from '../../utils';

export interface CloudflareDnsRecordProps extends QpqConstructBlockProps {
  buildPath: string;

  dnsEntries: CloudflareDnsEntries;
  certificateArn?: string;
  certificateDomain?: string;
  apiSecretName: string;
}

export class CloudflareDnsRecord extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: CloudflareDnsRecordProps) {
    super(scope, id, props);

    const func = new Function(this, `cloudflare`, {
      buildPath: props.buildPath,
      // TODO: Name this function something more descriptive
      // functionName: this.resourceName(`cf-dms`),
      functionType: 'lambdaCustomResource_cloudflareDns',
      executorName: 'executeCustomResourceCloudflareDns',

      qpqConfig: props.qpqConfig,

      awsAccountId: props.awsAccountId,

      environment: {
        certificateArn: props.certificateArn || '',
        certificateDomain: props.certificateDomain || '',
        certificateRegion: 'us-east-1',
      },
    });

    // TODO: Make this a utility function
    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
      props.awsAccountId,
    );

    grantables.forEach((g) => {
      g.grantAll(func.lambdaFunction);
    });
    // ///////// end todo

    const crProvider = new custom_resources.Provider(this, 'provider', {
      onEventHandler: func.lambdaFunction,
    });

    const properties: CloudflareDnsDeployEventCommon = {
      apiSecretName: props.apiSecretName,
      siteDns: qpqWebServerUtils.getDnsConfigs(props.qpqConfig)[0]?.dnsBase || '',
      dnsEntries: {
        ...props.dnsEntries,
      },
    };

    new CustomResource(this, `CustomResource`, {
      serviceToken: crProvider.serviceToken,
      properties: {
        ...properties,
        time: new Date().toISOString(),
      },
    });
  }
}
