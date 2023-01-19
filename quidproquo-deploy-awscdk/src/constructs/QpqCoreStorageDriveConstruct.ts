import { StorageDriveQPQConfigSetting } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';
import { aws_s3 } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreStorageDriveConstructProps
  extends QpqConstructProps<StorageDriveQPQConfigSetting> {}

export class QpqCoreStorageDriveConstruct extends QpqConstruct<StorageDriveQPQConfigSetting> {
  static getUniqueId(setting: StorageDriveQPQConfigSetting) {
    return setting.storageDrive;
  }

  constructor(scope: Construct, id: string, props: QpqCoreStorageDriveConstructProps) {
    super(scope, id, props);

    new aws_s3.Bucket(this, this.childId('bucket'), {
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
