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
  abstract storyResultsTable: aws_dynamodb.ITable;
  abstract fromStoryResultsTable: aws_dynamodb.ITable;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    this.storyResultsTable.grantReadData(grantee);
    this.fromStoryResultsTable.grantReadData(grantee);
    return this.bucket.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    this.storyResultsTable.grantWriteData(grantee);
    this.fromStoryResultsTable.grantWriteData(grantee);
    return this.bucket.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class LogStorage extends QpqConstructBlock {
  public readonly bucket: aws_s3.IBucket;
  public readonly storyResultsTable: aws_dynamodb.ITable;
  public readonly fromStoryResultsTable: aws_dynamodb.ITable;

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

      storyResultsTable = aws_dynamodb.Table.fromTableName(
        scope,
        `${id}-log-table`,
        this.qpqResourceName(serviceBucketName, 'log'),
      );

      fromStoryResultsTable = aws_dynamodb.Table.fromTableName(
        scope,
        `${id}-flog-table`,
        this.qpqResourceName(serviceBucketName, 'flog'),
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

    // Time based query over all logs for a given runtimeType
    const storyResultsTable = new aws_dynamodb.Table(this, 'table', {
      tableName: this.qpqResourceName(QPQ_LOG_BUCKET_NAME, 'log'),
      partitionKey: { name: 'runtimeType', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'startedAtWithCorrelation', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Query by correlation
    storyResultsTable.addGlobalSecondaryIndex({
      indexName: 'CorrelationIndex',
      partitionKey: { name: 'correlation', type: aws_dynamodb.AttributeType.STRING },
    });

    // Second table for the from logs ~ Second table because a GSI will dupe the data more then needed
    // Also, we cant have a GSI on keys that can be undefined, this table will only contain
    // logs with a fromCorrelation
    const fromStoryResultsTable = new aws_dynamodb.Table(this, 'from-table', {
      tableName: this.qpqResourceName(QPQ_LOG_BUCKET_NAME, 'flog'),
      partitionKey: { name: 'fromCorrelation', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'startedAtWithCorrelation', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.storyResultsTable = storyResultsTable;
    this.fromStoryResultsTable = fromStoryResultsTable;

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
