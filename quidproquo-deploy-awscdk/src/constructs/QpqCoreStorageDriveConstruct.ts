import { StorageDriveQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { QpqResource } from './core/QpqResource';
import { Construct } from 'constructs';
import { aws_s3, aws_iam } from 'aws-cdk-lib';
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
  ): QpqResource {
    class Import extends QpqCoreStorageDriveConstructBase {
      bucket = aws_s3.Bucket.fromBucketName(
        scope,
        `${id}-${setting.uniqueKey}`,
        this.resourceName(setting.storageDrive),
      );
    }

    return new Import(scope, id, { qpqConfig, setting });
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
  }
}
