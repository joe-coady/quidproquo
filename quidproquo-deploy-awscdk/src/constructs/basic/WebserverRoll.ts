import { aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

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
      // Resolve cross-stack resource names at runtime via CloudFormation exports.
      {
        sid: 'CloudFormationListExports',
        actions: ['cloudformation:ListExports'],
        resources: ['*'],
      },

      // Look up API Gateway metadata (stages, deployments) from within Lambdas.
      {
        sid: 'APIGatewayGetOperations',
        actions: ['apigateway:GET'],
        resources: ['*'],
      },

      // Invalidate CloudFront caches after web-entry static asset deploys.
      {
        sid: 'CloudFrontCreateInvalidation',
        actions: ['cloudfront:CreateInvalidation'],
        resources: ['*'],
      },

      // Publish to event-bus SNS topics (the framework's pub/sub layer).
      {
        sid: 'SNSPublishMessages',
        actions: ['sns:Publish'],
        resources: ['*'],
      },

      // Invoke QPQ service functions (`*sfunc*`) from other Lambdas.
      {
        sid: 'LambdaInvokeFunction',
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
      },

      // Push messages to websocket clients via API Gateway Management API.
      {
        sid: 'APIGatewayManageConnections',
        actions: ['execute-api:ManageConnections'],
        resources: ['*'],
      },

      // Look up ACM certs when wiring up custom domains at runtime.
      {
        sid: 'ACMCertificateOperations',
        actions: ['acm:DescribeCertificate', 'acm:ListCertificates'],
        resources: ['*'],
      },

      // Read/write key-value store (DynamoDB) tables used by QPQ services.
      {
        sid: 'DynamoDBTableOperations',
        actions: ['dynamodb:GetItem', 'dynamodb:Scan', 'dynamodb:Query', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
        resources: ['arn:aws:dynamodb:*:*:table/*'],
      },

      // Standard Lambda logging + log retrieval for the `askGetLogs` flow.
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

      // Required for VPC-attached Lambdas to manage their ENIs.
      {
        sid: 'EC2NetworkInterfacePermissions',
        actions: [
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
          'ec2:AssignPrivateIpAddresses',
          'ec2:UnassignPrivateIpAddresses',
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
