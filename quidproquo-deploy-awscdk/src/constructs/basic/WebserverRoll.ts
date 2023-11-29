import path from 'path';

import { QPQConfig } from 'quidproquo-core';
import { Construct } from 'constructs';
import { aws_iam } from 'aws-cdk-lib';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { QpqResource } from '../base';

export interface WebserverRollProps extends QpqConstructBlockProps {}

export abstract class WebserverRollConstructBase extends QpqConstructBlock implements QpqResource {
  public grantRead(grantee: aws_iam.IGrantable): void {}
  public grantWrite(grantee: aws_iam.IGrantable): void {}
  public grantAll(grantee: aws_iam.IGrantable): void {}
}

export class WebserverRoll extends QpqConstructBlock {
  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    awsAccountId: string,
    serviceBucketName: string,
  ): QpqResource {
    class Import extends WebserverRollConstructBase {}

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: WebserverRollProps) {
    super(scope, id, props);

    const serviceRoll = new aws_iam.Role(this, 'serviceRoll', {
      roleName: this.resourceName('service-roll'),
      assumedBy: new aws_iam.CompositePrincipal(
        // new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
        new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      ),
    });

    const policies: aws_iam.PolicyStatementProps[] = [
      {
        sid: 'CloudFormationListExports',
        actions: ['cloudformation:ListExports'],
        resources: ['*'],
      },
      {
        sid: 'APIGatewayGetOperations',
        actions: ['apigateway:GET'],
        resources: ['*'],
      },
      {
        sid: 'CloudFrontCreateInvalidation',
        actions: ['cloudfront:CreateInvalidation'],
        resources: ['*'],
      },
      {
        sid: 'SNSPublishMessages',
        actions: ['sns:Publish'],
        resources: ['*'],
      },
      {
        sid: 'LambdaInvokeFunction',
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
      },
      {
        sid: 'S3BucketOperations',
        actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
        resources: ['arn:aws:s3:::*'],
      },
      {
        sid: 'APIGatewayManageConnections',
        actions: ['execute-api:ManageConnections'],
        resources: ['*'],
      },
      {
        sid: 'ACMCertificateOperations',
        actions: ['acm:DescribeCertificate', 'acm:ListCertificates'],
        resources: ['*'],
      },
      {
        sid: 'DynamoDBTableOperations',
        actions: [
          'dynamodb:GetItem',
          'dynamodb:Scan',
          'dynamodb:Query',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        resources: ['arn:aws:dynamodb:*:*:table/*'],
      },
      {
        sid: 'CloudWatchLogsManagement',
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents',
          'logs:GetLogEvents',
          'logs:FilterLogEvents',
        ],
        resources: ['*'],
      },
    ];

    // policies.forEach((policy) => {
    //   serviceRoll.addToPolicy(new aws_iam.PolicyStatement(policy));
    // });
  }
}
