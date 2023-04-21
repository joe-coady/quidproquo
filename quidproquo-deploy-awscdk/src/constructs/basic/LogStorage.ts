import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_s3, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { QpqResource } from '../base';
import { QPQConfig } from 'quidproquo-core/lib';
import { QPQ_LOG_BUCKET_NAME } from '../../constants';

export interface LogStorageProps extends QpqConstructBlockProps {}

export abstract class LogStorageConstructBase extends QpqConstructBlock implements QpqResource {
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

export class LogStorage extends QpqConstructBlock {
  public readonly bucket: aws_s3.IBucket;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    awsAccountId: string,
    serviceBucketName: string,
  ): QpqResource {
    class Import extends LogStorageConstructBase {
      bucket = aws_s3.Bucket.fromBucketName(
        scope,
        `${id}-log-storage`,
        this.qpqResourceName(serviceBucketName, 'log'),
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: LogStorageProps) {
    super(scope, id, props);

    this.bucket = new aws_s3.Bucket(this, 'bucket', {
      bucketName: this.qpqResourceName(QPQ_LOG_BUCKET_NAME, 'log'),

      // Disable public access to this bucket
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}
