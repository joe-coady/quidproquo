import path from 'path';
import * as cdk from 'aws-cdk-lib';

import { qpqCoreUtils } from 'quidproquo-core';
import { SubdomainRedirectQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_lambda, aws_apigateway } from 'aws-cdk-lib';
import { SubdomainName } from '../../../basic/SubdomainName';

import { Function } from '../../../basic/Function';
import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqWebserverSubdomainRedirectConstructProps extends QpqConstructBlockProps {
  subdomainRedirectConfig: SubdomainRedirectQPQWebServerConfigSetting;
}

export class QpqWebserverSubdomainRedirectConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverSubdomainRedirectConstructProps) {
    super(scope, id, props);

    const environment = qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig);

    const func = new Function(this, 'redirect', {
      buildPath: qpqWebServerUtils.getRedirectApiBuildFullPath(props.qpqConfig, props.subdomainRedirectConfig),
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
