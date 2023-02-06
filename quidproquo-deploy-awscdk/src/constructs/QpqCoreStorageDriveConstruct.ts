import { StorageDriveQPQConfigSetting, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { QpqResource } from './core/QpqResource';
import { Construct } from 'constructs';
import { aws_s3, aws_iam, aws_s3_deployment } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreStorageDriveConstructProps
  extends QpqConstructProps<StorageDriveQPQConfigSetting> {}

export abstract class QpqCoreStorageDriveConstructBase
  extends QpqConstruct<StorageDriveQPQConfigSetting>
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

export class QpqCoreStorageDriveConstruct extends QpqCoreStorageDriveConstructBase {
  bucket: aws_s3.IBucket;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    setting: StorageDriveQPQConfigSetting,
    awsAccountId: string,
  ): QpqResource {
    class Import extends QpqCoreStorageDriveConstructBase {
      bucket = aws_s3.Bucket.fromBucketName(
        scope,
        `${id}-${setting.uniqueKey}`,
        this.resourceName(setting.storageDrive),
      );
    }

    return new Import(scope, id, { qpqConfig, setting, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreStorageDriveConstructProps) {
    super(scope, id, props);

    this.bucket = new aws_s3.Bucket(this, 'bucket', {
      bucketName: this.resourceName(props.setting.storageDrive),

      // Disable public access to this bucket, CloudFront will do that
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

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

    if (props.setting.copyPath) {
      const srcDir = qpqCoreUtils.getStorageDriveUploadFullPath(props.qpqConfig, props.setting);

      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(srcDir)],
        destinationBucket: this.bucket,
      });
    }
  }
}
