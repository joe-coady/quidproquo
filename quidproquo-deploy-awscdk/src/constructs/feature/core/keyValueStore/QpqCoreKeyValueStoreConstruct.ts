import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { KeyValueStoreQPQConfigSetting, KvsKey, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { aws_dynamodb, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils/qpqDeployAwsCdkUtils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

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

export const convertKvsKeyTypeToDynamodbAttributeType = (kvsKeyType: KvsKey['type']): aws_dynamodb.AttributeType => {
  switch (kvsKeyType) {
    case 'string':
      return aws_dynamodb.AttributeType.STRING;
    case 'number':
      return aws_dynamodb.AttributeType.NUMBER;
    case 'binary':
      return aws_dynamodb.AttributeType.BINARY;
  }

  throw new Error(`Unknown KvsKeyType: ${kvsKeyType}`);
};

export const convertKvsKeyToDynamodbAttribute = (kvsKey: KvsKey): aws_dynamodb.Attribute => ({
  name: kvsKey.key,
  type: convertKvsKeyTypeToDynamodbAttributeType(kvsKey.type),
});

export class QpqCoreKeyValueStoreConstruct extends QpqCoreKeyValueStoreConstructBase {
  table: aws_dynamodb.ITable;

  static fromOtherStack(scope: Construct, id: string, qpqConfig: QPQConfig, keyValueStoreName: string): QpqCoreKeyValueStoreConstructBase {
    const tableNameOverride = qpqConfigAwsUtils.getDynamoTableNameOverrride(keyValueStoreName, qpqConfig);

    class Import extends QpqCoreKeyValueStoreConstructBase {
      table = aws_dynamodb.Table.fromTableName(this, 'table', tableNameOverride || this.qpqResourceName(keyValueStoreName, 'kvs'));
    }

    return new Import(scope, id, { qpqConfig });
  }

  constructor(scope: Construct, id: string, props: QpqCoreKeyValueStoreConstructProps) {
    super(scope, id, props);

    const [primarySortKey] = props.keyValueStoreConfig.sortKeys;

    const table = new aws_dynamodb.Table(this, 'table', {
      tableName: this.qpqResourceName(props.keyValueStoreConfig.keyValueStoreName, 'kvs'),
      partitionKey: convertKvsKeyToDynamodbAttribute(props.keyValueStoreConfig.partitionKey),
      sortKey: primarySortKey && convertKvsKeyToDynamodbAttribute(primarySortKey),
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: props.keyValueStoreConfig.ttlAttribute,
      pointInTimeRecovery: props.keyValueStoreConfig.enableMonthlyRollingBackups,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(table, props.qpqConfig);

    // Do local secondary indexes
    for (let i = 1; i < props.keyValueStoreConfig.sortKeys.length; i++) {
      let sortKey = props.keyValueStoreConfig.sortKeys[i];

      table.addLocalSecondaryIndex({
        indexName: sortKey.key,
        sortKey: convertKvsKeyToDynamodbAttribute(sortKey),
      });
    }

    // Do global secondary indexes
    for (const index of props.keyValueStoreConfig.indexes) {
      table.addGlobalSecondaryIndex({
        indexName: index.partitionKey.key,
        partitionKey: convertKvsKeyToDynamodbAttribute(index.partitionKey),
        sortKey: index.sortKey && convertKvsKeyToDynamodbAttribute(index.sortKey),
      });
    }

    this.table = table;

    // If we have an override, lets use it instead
    // we still want to keep the above table created.
    const tableNameOverride = qpqConfigAwsUtils.getDynamoTableNameOverrride(props.keyValueStoreConfig.keyValueStoreName, props.qpqConfig);
    if (tableNameOverride) {
      console.log('tableNameOverride', tableNameOverride);
      this.table = aws_dynamodb.Table.fromTableName(this, 'tablelink', tableNameOverride);
    }
  }

  public static authorizeActionsForRole(role: aws_iam.IRole, kvsList: QpqCoreKeyValueStoreConstruct[]) {
    if (kvsList.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query', 'dynamodb:Scan', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
          resources: kvsList.map((kvs) => kvs.table.tableArn),
        }),
      );
    }
  }
}
