import { aws_apigateway, aws_lambda } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { ApiQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Function } from '../../../basic/Function';

import { qpqCoreUtils } from 'quidproquo-core';

export interface ApiQpqWebserverApiConstructProps extends QpqConstructBlockProps {
  apiConfig: ApiQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class ApiQpqWebserverApiConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: ApiQpqWebserverApiConstructProps) {
    super(scope, id, props);

    // Build Function
    const func = new Function(this, 'api-function', {
      buildPath: qpqWebServerUtils.getApiEntryFullPath(props.qpqConfig, props.apiConfig),
      functionName: this.resourceName(`${props.apiConfig.apiName}-route`),
      functionType: 'lambdaAPIGatewayEvent',
      executorName: 'executeAPIGatewayEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,

      role: this.getServiceRole(),
    });

    // Create a rest api
    const api = new aws_apigateway.LambdaRestApi(this, 'lambda-rest-api', {
      restApiName: this.resourceName(`${props.apiConfig.apiName}-rest-api`),
      handler: func.lambdaFunction,
      binaryMediaTypes: ['*/*'],
      proxy: true,
      cloudWatchRole: false,
      endpointTypes: [aws_apigateway.EndpointType.REGIONAL],
    });

    const baseDomain = qpqWebServerUtils.resolveDomainRoot(props.apiConfig.rootDomain, props.qpqConfig);

    const domain = `${props.apiConfig.apiSubdomain}.${baseDomain}`;

    new aws_apigateway.CfnBasePathMapping(this, 'bpm', {
      domainName: domain,
      basePath: qpqCoreUtils.getApplicationModuleName(props.qpqConfig),
      restApiId: api.restApiId,
      stage: api.deploymentStage.stageName,
    });
  }
}
