import path from 'path';
import * as cdk from 'aws-cdk-lib';

import { qpqCoreUtils } from 'quidproquo-core';
import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_lambda, aws_apigateway } from 'aws-cdk-lib';
import { SubdomainName } from '../../../basic/SubdomainName';

export interface QpqWebserverSubdomainRedirectConstructProps extends QpqConstructBlockProps {
  subdomainRedirectConfig: SubdomainRedirectQPQWebServerConfigSetting;
}

export class QpqWebserverSubdomainRedirectConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverSubdomainRedirectConstructProps) {
    super(scope, id, props);

    const buildPath = qpqCoreUtils.getBuildPath(props.qpqConfig);
    const environment = qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig);

    const redirectLambda = new aws_lambda.Function(this, 'lambda', {
      functionName: this.resourceName(`redirect-${props.subdomainRedirectConfig.subdomain}`),
      timeout: cdk.Duration.seconds(25),

      runtime: aws_lambda.Runtime.NODEJS_18_X,
      memorySize: 128,

      code: aws_lambda.Code.fromAsset(path.join(buildPath, 'lambdaAPIGatewayEvent_redirect')),
      handler: 'index.executeAPIGatewayEvent',

      environment: {
        redirectConfig: JSON.stringify(props.subdomainRedirectConfig),
        environment: JSON.stringify(environment),
      },
    });

    const restApi = new aws_apigateway.LambdaRestApi(this, 'rest-api', {
      restApiName: this.resourceName(`${props.subdomainRedirectConfig.subdomain}-redirect`),
      handler: redirectLambda,
      deployOptions: {
        loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      proxy: true,
    });

    // TODO: Fix this
    const serviceDomainName = new SubdomainName(this, 'service-domain-name', {
      subdomain: props.subdomainRedirectConfig.subdomain,
      apexDomain: '',
      qpqConfig: props.qpqConfig,
      awsAccountId: props.awsAccountId,
    });

    // Map all requests to this service to /serviceName/*
    new aws_apigateway.BasePathMapping(this, 'base-path-mapping', {
      domainName: serviceDomainName.domainName,
      restApi: restApi,

      // the properties below are optional
      // basePath: settings.service,
    });
  }
}
