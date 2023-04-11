import { KeyValueStoreQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_dynamodb, aws_iam } from 'aws-cdk-lib';

export interface QpqCoreKeyValueStoreConstructProps extends QpqConstructBlockProps {
  keyValueStoreConfig: KeyValueStoreQPQConfigSetting;
}

export abstract class QpqCoreKeyValueStoreConstructBase extends QpqConstructBlock {
  abstract table: aws_dynamodb.ITable;

  public grantRead(grantee: aws_iam.IGrantable) {
    this.table.grantReadData(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable) {
    this.table.grantWriteData(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable) {
    this.table.grantFullAccess(grantee);
  }
}

export class QpqCoreKeyValueStoreConstruct extends QpqCoreKeyValueStoreConstructBase {
  table: aws_dynamodb.ITable;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    awsAccountId: string,
    keyValueStoreName: string,
  ): QpqCoreKeyValueStoreConstructBase {
    class Import extends QpqCoreKeyValueStoreConstructBase {
      table = aws_dynamodb.Table.fromTableName(
        this,
        'table',
        this.qpqResourceName(keyValueStoreName, 'kvs'),
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreKeyValueStoreConstructProps) {
    super(scope, id, props);

    this.table = new aws_dynamodb.Table(this, 'table', {
      tableName: this.qpqResourceName(props.keyValueStoreConfig.keyValueStoreName, 'kvs'),
      partitionKey: {
        name: 'key',
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expires',
    });
  }
}
