import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqCoreUtils } from 'quidproquo-core';

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

    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(props.qpqConfig);
    const accountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(props.qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig);

    // This deployment's identity tags, as applied to every qpq resource by applyEnvironmentTags.
    // Used for tag-based conditions where the target resource's id is unknowable at synth
    // (later deploy phase / AWS-generated) but the resource is still owned by this deployment.
    const applicationResourceTagConditions = {
      'aws:ResourceTag/application': qpqCoreUtils.getApplicationName(props.qpqConfig),
      'aws:ResourceTag/environment': qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig),
      ...(feature ? { 'aws:ResourceTag/feature': feature } : {}),
    };
    const serviceResourceTagConditions = {
      ...applicationResourceTagConditions,
      'aws:ResourceTag/module': qpqCoreUtils.getApplicationModuleName(props.qpqConfig),
    };

    // Every event-bus topic this service can publish to (owned + referenced cross-module) -
    // the same owner-fallback derivation the runtime send processor uses to build the ARN.
    const eventBusTopicArns = qpqCoreUtils.getAllEventBusConfigs(props.qpqConfig).map((eventBusConfig) =>
      awsNamingUtils.getEventBusSnsTopicArn(
        eventBusConfig.owner?.resourceNameOverride || eventBusConfig.name,
        props.qpqConfig,

        eventBusConfig.owner?.module || qpqCoreUtils.getApplicationModuleName(props.qpqConfig),
        eventBusConfig.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig),
        eventBusConfig.owner?.application || qpqCoreUtils.getApplicationName(props.qpqConfig),
        eventBusConfig.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig),
      ),
    );

    const policies: aws_iam.PolicyStatementProps[] = [
      // Resolve cross-stack resource names at runtime via CloudFormation exports.
      {
        sid: 'CloudFormationListExports',
        actions: ['cloudformation:ListExports'],
        resources: ['*'],
      },

      // Read api-key values at runtime for api-key validation - keys are fetched individually
      // by id (never listed), so the grant is per-key, pinned to this application's tags.
      // Module is deliberately NOT pinned: routes may reference another service's key
      // (ApiKeyReference.serviceName) within the same application + environment.
      {
        sid: 'APIGatewayGetOperations',
        actions: ['apigateway:GET'],
        resources: [`arn:aws:apigateway:${region}::/apikeys/*`],
        conditions: {
          StringEquals: applicationResourceTagConditions,
        },
      },

      // Invalidate CloudFront caches after web-entry static asset deploys. The exact
      // distribution id lives in the separate web-phase stack (unknowable at synth), so the
      // resource is account-wide but the tag condition pins it to this service's own
      // distributions - evaluated at call time, immune to deploy ordering.
      {
        sid: 'CloudFrontCreateInvalidation',
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${accountId}:distribution/*`],
        conditions: {
          StringEquals: serviceResourceTagConditions,
        },
      },

      // Publish to event-bus SNS topics (the framework's pub/sub layer), scoped to the
      // buses this service declares. Omitted entirely when no event buses are configured.
      ...(eventBusTopicArns.length > 0
        ? [
            {
              sid: 'SNSPublishMessages',
              actions: ['sns:Publish'],
              resources: eventBusTopicArns,
            },
          ]
        : []),

      // Invoke QPQ service functions (`*sfunc*`) from other Lambdas.
      {
        sid: 'LambdaInvokeFunction',
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
      },

      // Look up ACM certs when wiring up custom domains at runtime.
      {
        sid: 'ACMCertificateOperations',
        actions: ['acm:DescribeCertificate', 'acm:ListCertificates'],
        resources: ['*'],
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
