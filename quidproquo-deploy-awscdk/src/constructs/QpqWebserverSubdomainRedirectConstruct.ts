import path from 'path';

import { qpqCoreUtils } from 'quidproquo-core';
import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';
import { aws_lambda, aws_apigateway } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { SubdomainName } from './basic/SubdomainName';

export interface QpqWebserverSubdomainRedirectConstructProps
  extends QpqConstructProps<SubdomainRedirectQPQWebServerConfigSetting> {}

export class QpqWebserverSubdomainRedirectConstruct extends QpqConstruct<SubdomainRedirectQPQWebServerConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqWebserverSubdomainRedirectConstructProps) {
    super(scope, id, props);

    const buildPath = qpqCoreUtils.getBuildPath(props.qpqConfig);
    const environment = qpqCoreUtils.getApplicationEnvironment(props.qpqConfig);

    const redirectLambda = new aws_lambda.Function(this, this.childId('lambda'), {
      functionName: this.resourceName(`redirect-${props.setting.subdomain}`),
      timeout: cdk.Duration.seconds(25),

      runtime: aws_lambda.Runtime.NODEJS_16_X,
      memorySize: 128,

      code: aws_lambda.Code.fromAsset(path.join(buildPath, 'lambdaAPIGatewayEvent_redirect')),
      handler: 'index.executeAPIGatewayEvent',

      environment: {
        redirectConfig: JSON.stringify(props.setting),
        environment: JSON.stringify(environment),
      },
    });

    const restApi = new aws_apigateway.LambdaRestApi(this, this.childId('rest-api'), {
      restApiName: this.resourceName(`${props.setting.subdomain}-redirect`),
      handler: redirectLambda,
      deployOptions: {
        loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      proxy: true,
    });

    // TODO: Fix this
    const serviceDomainName = new SubdomainName(this, this.childId('service-domain-name'), {
      subdomain: props.setting.subdomain,
      apexDomain: '',
      setting: props.setting,
      qpqConfig: props.qpqConfig,
    });

    // Map all requests to this service to /serviceName/*
    new aws_apigateway.BasePathMapping(this, this.childId('base-path-mapping'), {
      domainName: serviceDomainName.domainName,
      restApi: restApi,

      // the properties below are optional
      // basePath: settings.service,
    });
  }
}
