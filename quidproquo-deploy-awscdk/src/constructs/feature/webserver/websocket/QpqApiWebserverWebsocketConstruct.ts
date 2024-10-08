import { aws_lambda, aws_apigatewayv2, aws_iam, aws_logs, aws_apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { qpqCoreUtils } from 'quidproquo-core';
import { WebSocketQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { importStackValue } from '../../../../utils';
import { Function } from '../../../basic/Function';
import { SubdomainName } from '../../../basic';

export interface QpqApiWebserverWebsocketConstructProps extends QpqConstructBlockProps {
  websocketConfig: WebSocketQPQWebServerConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqApiWebserverWebsocketConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqApiWebserverWebsocketConstructProps) {
    super(scope, id, props);

    const region = qpqCoreUtils.getApplicationModuleDeployRegion(props.qpqConfig);

    const apiId = importStackValue(awsNamingUtils.getCFExportNameWebsocketApiIdFromConfig(props.websocketConfig.apiName, props.qpqConfig));

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
      functionType: 'apiGatwayEventWebsocketWithIdentity_websocketEvent',
      executorName: 'apiGatwayEventWebsocketWithIdentity_websocketEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,

      environment: {
        websocketApiName: props.websocketConfig.apiName,
      },

      role: this.getServiceRole(),
    });

    // Let api gateway invoke this ok
    func.lambdaFunction.grantInvoke(
      new aws_iam.ServicePrincipal('apigateway.amazonaws.com', {
        conditions: {
          ArnLike: {
            'aws:SourceArn': `arn:aws:execute-api:${region}:${props.awsAccountId}:${apiId}/*`,
          },
        },
      }),
    );

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

    // Attach a custom domain name to the api
    const apexDomain = props.websocketConfig.onRootDomain
      ? qpqWebServerUtils.getBaseDomainName(props.qpqConfig)
      : qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    // Create subdomain
    const subdomain = new SubdomainName(this, 'subdomain', {
      apexDomain,
      subdomain: props.websocketConfig.apiSubdomain,
      qpqConfig: props.qpqConfig,
      awsAccountId: props.awsAccountId,
    });

    // Create a mapping between the custom domain name and the WebSocket API
    new aws_apigatewayv2.CfnApiMapping(this, 'websocket-api-mapping', {
      apiId: apiId,
      domainName: subdomain.domainName.domainName,
      stage: stage.stageName,
    });
  }
}
