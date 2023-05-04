import path from 'path';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_s3, aws_iam, aws_dynamodb, aws_s3_notifications } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { QpqResource } from '../base';
import { QPQConfig } from 'quidproquo-core/lib';
import { QPQ_LOG_BUCKET_NAME } from '../../constants';
import { Function } from './Function';
// import { qpqWebServerUtils } from '../../utils';

export interface LogStorageProps extends QpqConstructBlockProps {}

export abstract class LogStorageConstructBase extends QpqConstructBlock implements QpqResource {
  abstract bucket: aws_s3.IBucket;
  abstract table: aws_dynamodb.ITable;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    this.table.grantReadData(grantee);
    return this.bucket.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    this.table.grantWriteData(grantee);
    return this.bucket.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class LogStorage extends QpqConstructBlock {
  public readonly bucket: aws_s3.IBucket;
  public readonly table: aws_dynamodb.ITable;

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

      table = aws_dynamodb.Table.fromTableName(
        scope,
        `${id}-table`,
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

    const storyResultsTable = new aws_dynamodb.Table(this, 'StoryResultsTable', {
      tableName: this.qpqResourceName(QPQ_LOG_BUCKET_NAME, 'log'),
      partitionKey: { name: 'filePath', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'startedAt', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // storyResultsTable.addGlobalSecondaryIndex({
    //   indexName: 'ErrorIndex',
    //   partitionKey: { name: 'error', type: aws_dynamodb.AttributeType.STRING },
    //   sortKey: { name: 'startedAt', type: aws_dynamodb.AttributeType.STRING },
    //   projectionType: aws_dynamodb.ProjectionType.ALL,
    // });

    this.table = storyResultsTable;

    // Create a lambda that is trigged when files are written to the bucket
    const func = new Function(this, 'function', {
      buildPath: path.join(__dirname, '../..'),
      functionName: this.qpqResourceName(QPQ_LOG_BUCKET_NAME, 'log'),
      functionType: 'lambdas',
      executorName: 'executeS3FileWriteEvent',
      srcFilename: 'lambdaS3FileWriteEvent_log',

      qpqConfig: props.qpqConfig,

      awsAccountId: props.awsAccountId,
    });

    // Grant the Lambda function read access to the S3 bucket / dynamo table
    this.bucket.grantRead(func.lambdaFunction);
    storyResultsTable.grantWriteData(func.lambdaFunction);

    this.bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(func.lambdaFunction),
    );
  }
}
