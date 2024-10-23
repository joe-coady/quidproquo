import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { VirtualNetworkQPQConfigSetting } from 'quidproquo-core';

import { aws_ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface BootstrapQpqCoreVirtualNetworkConstructProps extends QpqConstructBlockProps {
  virtualNetworkConfig: VirtualNetworkQPQConfigSetting;
}

export class BootstrapQpqCoreVirtualNetworkConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: BootstrapQpqCoreVirtualNetworkConstructProps) {
    super(scope, id, props);

    const vpcName = awsNamingUtils.getConfigRuntimeBootstrapResourceNameFromConfig(props.virtualNetworkConfig.name, props.qpqConfig);

    const vpc = new aws_ec2.Vpc(this, 'vpc', {
      maxAzs: 2,
      vpcName: vpcName,
    });
  }
}
