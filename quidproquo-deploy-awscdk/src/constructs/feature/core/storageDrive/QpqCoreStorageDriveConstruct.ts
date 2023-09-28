import { StorageDriveQPQConfigSetting, QPQConfig, qpqCoreUtils, StorageDriveLifecycleRule, StorageDriveTransition } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_s3, aws_iam, aws_s3_deployment } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreStorageDriveConstructProps extends QpqConstructBlockProps {
  storageDriveConfig: StorageDriveQPQConfigSetting;
}

export abstract class QpqCoreStorageDriveConstructBase
  extends QpqConstructBlock
  implements QpqResource
{
  abstract bucket: aws_s3.IBucket;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.bucket.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.bucket.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

const convertStorageDriveTransitionToAwsS3Transition = (storageDriveTransition: StorageDriveTransition): aws_s3.Transition => ({
  storageClass: aws_s3.StorageClass.DEEP_ARCHIVE,
  transitionAfter: typeof(storageDriveTransition.transitionAfterDays) === 'number' ? cdk.Duration.days(storageDriveTransition.transitionAfterDays) : undefined,
  transitionDate: typeof(storageDriveTransition.transitionDate) === 'string' ? new Date(storageDriveTransition.transitionDate) : undefined,
});

const convertStorageDriveLifecycleRuleToAwsS3LifecycleRule = (
  lifecycleRule: StorageDriveLifecycleRule,
): aws_s3.LifecycleRule => ({
  prefix: lifecycleRule.prefix,
  expiration: lifecycleRule.deleteAfterDays ? cdk.Duration.days(lifecycleRule.deleteAfterDays) : undefined,
  objectSizeGreaterThan: lifecycleRule.fileSizeGreaterThan,
  objectSizeLessThan: lifecycleRule.fileSizeLessThan,
  transitions: lifecycleRule.transitions?.map(convertStorageDriveTransitionToAwsS3Transition)
})

export class QpqCoreStorageDriveConstruct extends QpqCoreStorageDriveConstructBase {
  bucket: aws_s3.IBucket;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    storageDriveConfig: StorageDriveQPQConfigSetting,
    awsAccountId: string,
  ): QpqCoreStorageDriveConstructBase {
    class Import extends QpqCoreStorageDriveConstructBase {
      bucket = aws_s3.Bucket.fromBucketName(
        scope,
        `${id}-${storageDriveConfig.uniqueKey}`,
        this.resourceName(storageDriveConfig.storageDrive),
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreStorageDriveConstructProps) {
    super(scope, id, props);

    console.log(JSON.stringify(
      props.storageDriveConfig.lifecycleRules?.map(convertStorageDriveLifecycleRuleToAwsS3LifecycleRule),
      null,
      2
    ));

    this.bucket = new aws_s3.Bucket(this, 'bucket', {
      bucketName: this.resourceName(props.storageDriveConfig.storageDrive),

      // Disable public access to this bucket, CloudFront will do that
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,

      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [aws_s3.HttpMethods.GET, aws_s3.HttpMethods.HEAD],
          allowedHeaders: ['*'],
        },
      ],

      lifecycleRules: props.storageDriveConfig.lifecycleRules?.map(convertStorageDriveLifecycleRuleToAwsS3LifecycleRule),
    });

    // TODO: Only do this IF a cloud front dist wants to use it
    // same with cors above.
    this.bucket.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        sid: 'AllowCloudFrontServicePrincipal',
        effect: aws_iam.Effect.ALLOW,
        principals: [new aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        conditions: {
          StringLike: {
            'AWS:SourceArn': `arn:aws:cloudfront::${props.awsAccountId}:distribution/*`,
          },
        },
      }),
    );

    // if (props.storageDriveConfig.global) {
    //   this.bucket.addToResourcePolicy(
    //     new aws_iam.PolicyStatement({
    //       sid: 'AllowAllEntitiesInAccount',
    //       effect: aws_iam.Effect.ALLOW,
    //       principals: [new aws_iam.AccountPrincipal(props.awsAccountId)],
    //       actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
    //       resources: [this.bucket.arnForObjects('*'), this.bucket.bucketArn],
    //     }),
    //   );
    // }

    if (props.storageDriveConfig.copyPath) {
      const srcDir = qpqCoreUtils.getStorageDriveUploadFullPath(
        props.qpqConfig,
        props.storageDriveConfig,
      );

      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(srcDir)],
        destinationBucket: this.bucket,
      });
    }
  }
}
