import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils,SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';

import * as cdk from 'aws-cdk-lib';
import { aws_apigateway,aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Function } from '../../../basic/Function';
import { SubdomainName } from '../../../basic/SubdomainName';

export interface QpqWebserverSubdomainRedirectConstructProps extends QpqConstructBlockProps {
  subdomainRedirectConfig: SubdomainRedirectQPQWebServerConfigSetting;
}

export class QpqWebserverSubdomainRedirectConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverSubdomainRedirectConstructProps) {
    super(scope, id, props);

    const environment = qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig);

    const func = new Function(this, 'redirect', {
      functionName: this.resourceName(`${props.subdomainRedirectConfig.subdomain}-redirect`),
      functionType: 'apiGatewayEventHandler_redirect',
      executorName: 'apiGatewayEventHandler_redirect',

      qpqConfig: props.qpqConfig,

      environment: {
        redirectConfig: JSON.stringify(props.subdomainRedirectConfig),
        environment: JSON.stringify(environment),
        featureEnvironment: JSON.stringify(feature),
      },

      awsAccountId: props.awsAccountId,

      role: this.getServiceRole(),
    });

    const restApi = new aws_apigateway.LambdaRestApi(this, 'rest-api', {
      restApiName: this.resourceName(`${props.subdomainRedirectConfig.subdomain}-redirect`),
      handler: func.lambdaFunction,
      deployOptions: {
        loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      proxy: true,
    });

    // www.service.domain.com or www.domain.com
    const apexDomain = props.subdomainRedirectConfig.onRootDomain
      ? qpqWebServerUtils.getBaseDomainName(props.qpqConfig)
      : qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    const serviceDomainName = new SubdomainName(this, 'service-domain-name', {
      subdomain: props.subdomainRedirectConfig.subdomain,
      apexDomain,
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
