import { aws_lambda, aws_apigatewayv2, aws_iam, aws_logs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { WebSocketQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base';
import { exportStackValue, importStackValue } from '../../../../utils';
import { Function } from '../../../basic/Function';



export interface QpqApiWebserverWebsocketConstructProps extends QpqConstructBlockProps {
  websocketConfig: WebSocketQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqApiWebserverWebsocketConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqApiWebserverWebsocketConstructProps) {
    super(scope, id, props);

    const region = qpqCoreUtils.getApplicationModuleDeployRegion(props.qpqConfig);

    const apiId = importStackValue(awsNamingUtils.getCFExportNameWebsocketApiIdFromConfig(
      props.websocketConfig.apiName,
      props.qpqConfig,
    ));

    const deployment = new aws_apigatewayv2.CfnDeployment(this, 'websocket-deployment', {
      apiId,
    });

    const stage = new aws_apigatewayv2.CfnStage(this, 'websocket-stage', {
      apiId,
      deploymentId: deployment.ref,
      stageName: 'prod',
    });

    const func = new Function(this, 'api-function', {
      buildPath: qpqWebServerUtils.getWebsocketEntryFullPath(props.qpqConfig, props.websocketConfig),
      functionName: this.resourceName(`${props.websocketConfig.apiName}-ws`),
      functionType: 'lambdaWebsocketAPIGatewayEvent',
      executorName: 'executeWebsocketAPIGatewayEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,

      environment: {
        websocketApiName: props.websocketConfig.apiName,
      },
    });

    // Let api gateway invoke this ok
    func.lambdaFunction.grantInvoke(new aws_iam.ServicePrincipal('apigateway.amazonaws.com', {
      conditions: {
        ArnLike: {
          'aws:SourceArn': `arn:aws:execute-api:${region}:${props.awsAccountId}:${apiId}/*`,
        },
      },
    }));
    
    const integration = new aws_apigatewayv2.CfnIntegration(this, 'websocket-integration', {
      apiId,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${func.lambdaFunction.functionArn}/invocations`,
    });

    // Create the route and associate it with the integration
    const connectRoute = new aws_apigatewayv2.CfnRoute(this, 'connect-route', {
      apiId,
      routeKey: '$connect',
      target: `integrations/${integration.ref}`,
      apiKeyRequired: false,
      authorizationType: 'NONE',
      operationName: 'connect',
    });

    // Create the route and associate it with the integration
    const disconnectRoute = new aws_apigatewayv2.CfnRoute(this, 'disconnect-route', {
      apiId,
      routeKey: '$disconnect',
      target: `integrations/${integration.ref}`,
      apiKeyRequired: false,
      authorizationType: 'NONE',
      operationName: 'disconnect',
    });

    // Create the route and associate it with the integration
    const defaultRoute = new aws_apigatewayv2.CfnRoute(this, 'default-route', {
      apiId,
      routeKey: '$default',
      target: `integrations/${integration.ref}`,
      apiKeyRequired: false,
      authorizationType: 'NONE',
      operationName: 'default',
    });

    deployment.addDependency(connectRoute);
    deployment.addDependency(disconnectRoute);
    deployment.addDependency(defaultRoute);    
  }
}
