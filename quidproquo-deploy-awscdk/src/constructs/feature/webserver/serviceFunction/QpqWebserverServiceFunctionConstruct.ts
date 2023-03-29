import { aws_apigateway, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ServiceFunctionQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Function } from '../../../basic/Function';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqWebserverServiceFunctionConstructProps extends QpqConstructBlockProps {
  serviceFunctionConfig: ServiceFunctionQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqWebserverServiceFunctionConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverServiceFunctionConstructProps) {
    super(scope, id, props);

    // Build Function
    const func = new Function(this, 'api-function', {
      buildPath: qpqWebServerUtils.getServiceFunctionFullPath(
        props.qpqConfig,
        props.serviceFunctionConfig,
      ),
      functionName: this.resourceName(`${props.serviceFunctionConfig.functionName}-sfunc`),
      functionType: 'lambdaServiceFunctionExecute',
      executorName: 'executeServiceFunctionExecuteEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,
    });

    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
      props.awsAccountId,
    );

    grantables.forEach((g) => {
      g.grantAll(func.lambdaFunction);
    });
  }
}
