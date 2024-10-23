import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils,WebSocketQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { aws_apigateway, aws_apigatewayv2, aws_iam,aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { exportStackValue } from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface QpqWebserverWebsocketConstructProps extends QpqConstructBlockProps {
  websocketConfig: WebSocketQPQWebServerConfigSetting;
}

export class QpqWebserverWebsocketConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverWebsocketConstructProps) {
    super(scope, id, props);

    const api = new aws_apigatewayv2.CfnApi(this, 'websocket-api', {
      name: this.resourceName(props.websocketConfig.apiName),
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.type',
    });

    exportStackValue(this, awsNamingUtils.getCFExportNameWebsocketApiIdFromConfig(props.websocketConfig.apiName, props.qpqConfig), api.ref);
  }
}
