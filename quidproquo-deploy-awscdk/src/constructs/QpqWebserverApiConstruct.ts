import path from 'path';

import { aws_apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { SubdomainName } from './basic/SubdomainName';
import { Function } from './basic/Function';

import * as qpqDeployAwsCdkUtils from '../qpqDeployAwsCdkUtils';

export interface QpqWebserverApiConstructProps
  extends QpqConstructProps<ApiQPQWebServerConfigSetting> {}

export class QpqWebserverApiConstruct extends QpqConstruct<ApiQPQWebServerConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqWebserverApiConstructProps) {
    super(scope, id, props);

    // api.service.domain.com or api.domain.com
    const apexDomain = props.setting.onRootDomain
      ? qpqWebServerUtils.getBaseDomainName(props.qpqConfig)
      : qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    // Create subdomain
    const subdomain = new SubdomainName(this, 'subdomain', {
      apexDomain,
      subdomain: props.setting.apiSubdomain,
      qpqConfig: props.qpqConfig,
      setting: props.setting,
    });

    // Build Function
    const func = new Function(this, 'api-function', {
      buildPath: qpqWebServerUtils.getApiEntryFullPath(props.qpqConfig, props.setting),
      functionName: this.resourceName(`${props.setting.apiName}-route`),
      functionType: 'lambdaAPIGatewayEvent',
      executorName: 'executeAPIGatewayEvent',

      qpqConfig: props.qpqConfig,
      setting: props.setting,

      apiLayerVersions: props.apiLayerVersions,
    });

    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
    );

    grantables.forEach((g) => {
      g.grantAll(func.lambdaFunction);
    });

    // Create a rest api
    const api = new aws_apigateway.LambdaRestApi(this, 'lambda-rest-api', {
      restApiName: this.resourceName(`${props.setting.apiName}-rest-api`),
      handler: func.lambdaFunction,
      deployOptions: {
        loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      binaryMediaTypes: ['*/*'],
      proxy: true,
    });

    // Map all requests to this service to /serviceName/*
    new aws_apigateway.BasePathMapping(this, 'rest-bpm', {
      domainName: subdomain.domainName,
      restApi: api,

      // the properties below are optional
      // basePath: settings.service,
    });
  }
}
