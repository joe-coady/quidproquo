import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { AwsVpcFlowLogTrafficType, qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { VirtualNetworkQPQConfigSetting } from 'quidproquo-core';

import { aws_ec2, aws_logs } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { resolveLogRetention } from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface BootstrapQpqCoreVirtualNetworkConstructProps extends QpqConstructBlockProps {
  virtualNetworkConfig: VirtualNetworkQPQConfigSetting;
}

const flowLogTrafficTypeMap: Record<AwsVpcFlowLogTrafficType, aws_ec2.FlowLogTrafficType> = {
  [AwsVpcFlowLogTrafficType.all]: aws_ec2.FlowLogTrafficType.ALL,
  [AwsVpcFlowLogTrafficType.accept]: aws_ec2.FlowLogTrafficType.ACCEPT,
  [AwsVpcFlowLogTrafficType.reject]: aws_ec2.FlowLogTrafficType.REJECT,
};

export class BootstrapQpqCoreVirtualNetworkConstruct extends QpqConstructBlock {
  public readonly vpc: aws_ec2.Vpc;

  constructor(scope: Construct, id: string, props: BootstrapQpqCoreVirtualNetworkConstructProps) {
    super(scope, id, props);

    const vpcName = awsNamingUtils.getConfigRuntimeBootstrapResourceNameFromConfig(props.virtualNetworkConfig.name, props.qpqConfig);

    const settings = qpqConfigAwsUtils.getAwsVirtualNetworkSettings(props.qpqConfig, props.virtualNetworkConfig.name);

    this.vpc = new aws_ec2.Vpc(this, 'vpc', {
      maxAzs: settings.maxAzs,
      vpcName: vpcName,

      // undefined = CDK default (one per AZ) — must pass through untouched so
      // already-deployed VPCs see no subnet/NAT churn
      natGateways: settings.natGateways,
    });

    if (!settings.flowLogs.disable) {
      const flowLogGroup = new aws_logs.LogGroup(this, 'flow-log-group', {
        logGroupName: `/qpq/vpc-flow-logs/${vpcName}`,
        retention: resolveLogRetention(settings.flowLogs.retentionDays),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      this.vpc.addFlowLog('flow-log', {
        destination: aws_ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup),
        trafficType: flowLogTrafficTypeMap[settings.flowLogs.trafficType],
      });
    }

    if (!settings.disableS3GatewayEndpoint) {
      this.vpc.addGatewayEndpoint('s3-endpoint', {
        service: aws_ec2.GatewayVpcEndpointAwsService.S3,
      });
    }

    if (!settings.disableDynamoDbGatewayEndpoint) {
      this.vpc.addGatewayEndpoint('dynamodb-endpoint', {
        service: aws_ec2.GatewayVpcEndpointAwsService.DYNAMODB,
      });
    }

    for (const serviceName of settings.interfaceEndpoints) {
      // CDK defaults are what we want: one ENI per AZ in the private subnets,
      // an auto-created security group allowing HTTPS from the VPC CIDR, and
      // private DNS on — lambdas resolve the service to the endpoint with no
      // code changes.
      this.vpc.addInterfaceEndpoint(`interface-endpoint-${serviceName}`, {
        service: new aws_ec2.InterfaceVpcEndpointAwsService(serviceName),
      });
    }
  }
}
