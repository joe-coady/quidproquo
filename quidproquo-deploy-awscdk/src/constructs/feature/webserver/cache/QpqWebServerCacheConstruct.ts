import { QPQConfig } from 'quidproquo-core';

import { CacheQPQWebServerConfigSetting, qpqHeaderIsBot } from 'quidproquo-webserver';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_s3, aws_cloudfront } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqWebServerCacheConstructProps extends QpqConstructBlockProps {
  cacheConfig: CacheQPQWebServerConfigSetting;
}

export class QpqWebServerCacheConstruct extends QpqConstructBlock {
  cachePolicy: aws_cloudfront.ICachePolicy;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    cacheConfig: CacheQPQWebServerConfigSetting,
    awsAccountId: string,
  ): QpqWebServerCacheConstruct {
    const cachePolicyId = qpqDeployAwsCdkUtils.importStackValue(
      awsNamingUtils.getCFExportNameCachePolicyIdFromConfig(cacheConfig.name, qpqConfig, cacheConfig.owner?.module, cacheConfig.owner?.application),
    );

    class Import extends QpqConstructBlock {
      cachePolicy = aws_cloudfront.CachePolicy.fromCachePolicyId(scope, `${id}-${cacheConfig.uniqueKey}`, cachePolicyId);
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqWebServerCacheConstructProps) {
    super(scope, id, props);

    this.cachePolicy = new aws_cloudfront.CachePolicy(this, `dist-cp`, {
      cachePolicyName: this.resourceName(props.cacheConfig.name),
      defaultTtl: cdk.Duration.seconds(props.cacheConfig.cache.defaultTTLInSeconds),
      minTtl: cdk.Duration.seconds(props.cacheConfig.cache.minTTLInSeconds),
      maxTtl: cdk.Duration.seconds(props.cacheConfig.cache.maxTTLInSeconds),

      headerBehavior: aws_cloudfront.CacheHeaderBehavior.allowList(
        qpqHeaderIsBot,
        'Origin',
        'Access-Control-Request-Headers',
        'Access-Control-Request-Method',
      ),

      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameCachePolicyIdFromConfig(
        props.cacheConfig.name,
        props.qpqConfig,
        props.cacheConfig.owner?.module,
        props.cacheConfig.owner?.application,
      ),
      this.cachePolicy.cachePolicyId,
    );
  }
}
