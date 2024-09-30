import { GraphDatabaseQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';

import { Construct } from 'constructs';
import { aws_dynamodb, aws_iam, aws_ec2, aws_logs } from 'aws-cdk-lib';
import * as aws_neptune from '@aws-cdk/aws-neptune-alpha';

export interface QpqCoreApiGraphDatabaseConstructProps extends QpqConstructBlockProps {
  graphDatabaseConfig: GraphDatabaseQPQConfigSetting;
}

export class QpqCoreApiGraphDatabaseConstruct extends QpqConstructBlock {
  cluster: aws_neptune.IDatabaseCluster;

  static fromOtherStack(scope: Construct, id: string, qpqConfig: QPQConfig, awsAccountId: string, keyValueStoreName: string): QpqConstructBlock {
    const tableNameOverride = qpqConfigAwsUtils.getDynamoTableNameOverrride(keyValueStoreName, qpqConfig);

    class Import extends QpqConstructBlock {
      table = aws_dynamodb.Table.fromTableName(this, 'table', tableNameOverride || this.qpqResourceName(keyValueStoreName, 'kvs'));
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreApiGraphDatabaseConstructProps) {
    super(scope, id, props);

    console.log('Graph Database');

    const vpc = new aws_ec2.Vpc(this, 'NeptuneVpc', {
      maxAzs: 2,
    });

    const clusterParameterGroup = new aws_neptune.ClusterParameterGroup(this, 'ClusterParams', {
      description: 'Cluster parameter group',
      parameters: {
        neptune_enable_audit_log: '1',
      },
    });

    this.cluster = new aws_neptune.DatabaseCluster(this, 'Database', {
      vpc,
      instanceType: aws_neptune.InstanceType.SERVERLESS,

      serverlessScalingConfiguration: {
        minCapacity: 1,
        maxCapacity: 2.5,
      },

      vpcSubnets: {
        subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },

      // Optionally configuring audit logs to be exported to CloudWatch Logs
      cloudwatchLogsExports: [aws_neptune.LogType.AUDIT],
      // Optionally set a retention period on exported CloudWatch Logs
      cloudwatchLogsRetention: aws_logs.RetentionDays.ONE_WEEK,
    });

    this.cluster.connections.allowDefaultPortFromAnyIpv4('Open to the world');
  }

  public static authorizeActionsForRole(role: aws_iam.IRole, graphDatabaseList: QpqCoreApiGraphDatabaseConstruct[]) {
    if (graphDatabaseList.length > 0) {
      // role.addToPrincipalPolicy(
      //   new aws_iam.PolicyStatement({
      //     effect: aws_iam.Effect.ALLOW,
      //     actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query', 'dynamodb:Scan', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
      //     resources: graphDatabaseList.map((kvs) => kvs.table.tableArn),
      //   }),
      // );
    }
  }
}
