import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils, WebSocketQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { aws_apigateway, aws_apigatewayv2, aws_iam, aws_lambda, aws_ssm } from 'aws-cdk-lib';
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

    // Published so referencing services (which can't know the AWS-generated id at synth)
    // can resolve it at deploy time for their scoped ManageConnections grants
    new aws_ssm.StringParameter(this, 'websocket-api-id-param', {
      parameterName: awsNamingUtils.getWebsocketApiIdSsmParameterName(props.websocketConfig.apiName, props.qpqConfig),
      stringValue: this.api.ref,
    });
  }

  // Scope websocket pushes to this service's own websocket apis (exact api ids), mirroring
  // the per-pool Cognito grant pattern. A service can also push to websocket apis it
  // references but does not own - e.g. a shared websocket-queue owned by another module,
  // where service-request responses are pushed straight from the responding service's
  // lambda. Those api ids are AWS-generated in the owning service's stack and CANNOT be
  // resolved here: modules reference each other's websockets (admin <-> websocket-queue),
  // so hard SSM/export references deadlock every environment's inf deploys, and synth-time
  // lookups go stale in cdk.context.json. The ceiling for referenced apis is send-only on
  // the prod stage: POST /@connections (post messages only - no disconnect/enumerate; the
  // runtime's push endpoint hardcodes /prod, so both sides change together if the stage
  // ever moves). No-op when the config declares no websockets.
  public static authorizeManageConnectionsForRole(
    role: aws_iam.IRole,
    websocketConstructs: QpqWebserverWebsocketConstruct[],
    qpqConfig: QPQConfig,
  ): void {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
    const accountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(qpqConfig);

    const resources = websocketConstructs.map((websocket) => `arn:aws:execute-api:${region}:${accountId}:${websocket.api.ref}/*`);

    const referencesUnownedWebsockets = qpqWebServerUtils.getWebsocketSettings(qpqConfig).length > websocketConstructs.length;
    if (referencesUnownedWebsockets) {
      resources.push(`arn:aws:execute-api:${region}:${accountId}:*/prod/POST/@connections/*`);
    }

    if (resources.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          sid: 'APIGatewayManageConnections',
          effect: aws_iam.Effect.ALLOW,
          actions: ['execute-api:ManageConnections'],
          resources,
        }),
      );
    }
  }
}
