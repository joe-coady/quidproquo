import { Construct } from 'constructs';
import { aws_iam } from 'aws-cdk-lib';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';

export interface WebserverRollProps extends QpqConstructBlockProps {}

export class WebserverRoll extends QpqConstructBlock {
  role: aws_iam.IRole;

  constructor(scope: Construct, id: string, props: WebserverRollProps) {
    super(scope, id, props);

    const role = new aws_iam.Role(this, 'role', {
      roleName: this.resourceName('service-role'),
      assumedBy: new aws_iam.CompositePrincipal(
        new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        new aws_iam.ServicePrincipal('transfer.amazonaws.com'),
        new aws_iam.ServicePrincipal('edgelambda.amazonaws.com'),
        // new aws_iam.ServicePrincipal('neptune.amazonaws.com'),
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
        actions: ['dynamodb:GetItem', 'dynamodb:Scan', 'dynamodb:Query', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
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

    policies.forEach((policy) => {
      role.addToPolicy(new aws_iam.PolicyStatement(policy));
    });

    this.role = role;
  }
}
