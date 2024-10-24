import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { ServiceFunctionQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { aws_ec2, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Function } from '../../../basic/Function';

export interface QpqWebserverServiceFunctionConstructProps extends QpqConstructBlockProps {
  serviceFunctionConfig: ServiceFunctionQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqWebserverServiceFunctionConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverServiceFunctionConstructProps) {
    super(scope, id, props);

    const vpc = props.serviceFunctionConfig.virtualNetworkName
      ? aws_ec2.Vpc.fromLookup(this, 'vpc-lookup', {
          vpcName: awsNamingUtils.getConfigRuntimeBootstrapResourceNameFromConfig(props.serviceFunctionConfig.virtualNetworkName, props.qpqConfig),
        })
      : undefined;

    // Build Function
    const func = new Function(this, 'api-function', {
      functionName: this.resourceName(`${props.serviceFunctionConfig.functionName}-sfunc`),
      functionType: 'anyExecuteServiceFunctionEvent_serviceFunction',
      executorName: 'anyExecuteServiceFunctionEvent_serviceFunction',

      timeoutInSeconds: 14.5 * 60,

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      role: this.getServiceRole(),
      vpc: vpc,
    });
  }
}
