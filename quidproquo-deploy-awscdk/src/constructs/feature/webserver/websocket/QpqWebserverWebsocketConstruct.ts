import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils, WebSocketQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { aws_apigateway, aws_apigatewayv2, aws_iam, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { exportStackValue } from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface QpqWebserverWebsocketConstructProps extends QpqConstructBlockProps {
  websocketConfig: WebSocketQPQWebServerConfigSetting;
}

export class QpqWebserverWebsocketConstruct extends QpqConstructBlock {
  public api: aws_apigatewayv2.CfnApi;

  constructor(scope: Construct, id: string, props: QpqWebserverWebsocketConstructProps) {
    super(scope, id, props);

    this.api = new aws_apigatewayv2.CfnApi(this, 'websocket-api', {
      name: this.resourceName(props.websocketConfig.apiName),
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.type',
    });

    exportStackValue(this, awsNamingUtils.getCFExportNameWebsocketApiIdFromConfig(props.websocketConfig.apiName, props.qpqConfig), this.api.ref);
  }

  // Scope websocket pushes (PostToConnection etc.) to this service's own websocket apis,
  // mirroring the per-pool Cognito grant pattern. No-op when the service owns no websockets.
  public static authorizeManageConnectionsForRole(
    role: aws_iam.IRole,
    websocketConstructs: QpqWebserverWebsocketConstruct[],
    qpqConfig: QPQConfig,
  ): void {
    if (websocketConstructs.length > 0) {
      const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
      const accountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(qpqConfig);

      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          sid: 'APIGatewayManageConnections',
          effect: aws_iam.Effect.ALLOW,
          actions: ['execute-api:ManageConnections'],
          resources: websocketConstructs.map((websocket) => `arn:aws:execute-api:${region}:${accountId}:${websocket.api.ref}/*`),
        }),
      );
    }
  }
}
