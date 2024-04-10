import { aws_cloudfront } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import {
  ResponseSecurityHeaders,
  ResponseHeadersStrictTransportSecurity,
  ResponseHeadersContentSecurityPolicy,
  ResponseHeadersContentTypeOptions,
  ResponseHeadersFrameOptions,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  ResponseHeadersReferrerPolicy,
  ResponseHeadersXSSProtection,
  ContentSecurityPolicyEntry,
  QpqServiceContentSecurityPolicy,
} from 'quidproquo-webserver';

export const convertStrictTransportSecurity = (
  strictTransportSecurity?: ResponseHeadersStrictTransportSecurity,
): aws_cloudfront.ResponseHeadersStrictTransportSecurity | undefined => {
  if (!strictTransportSecurity) {
    return {
      override: true,
      accessControlMaxAge: cdk.Duration.hours(1),
      includeSubdomains: true,
      preload: true,
    };
  }

  return {
    accessControlMaxAge: cdk.Duration.seconds(strictTransportSecurity.accessControlMaxAgeInSeconds),
    override: strictTransportSecurity.override,
    includeSubdomains: strictTransportSecurity.includeSubdomains,
    preload: strictTransportSecurity.preload,
  };
};

export const convertContentSecurityPolicyEntryToString = (
  baseDomain: string,
  contentSecurityPolicyEntry: ContentSecurityPolicyEntry,
): string => {
  if (typeof contentSecurityPolicyEntry === 'string') {
    return contentSecurityPolicyEntry;
  }

  // Otherwise its a QpqServiceContentSecurityPolicy
  const scsp: QpqServiceContentSecurityPolicy = contentSecurityPolicyEntry;
  const domain = scsp.domain || baseDomain;

  const fullDomain = scsp.service
    ? `${scsp.api}.${scsp.service}.${domain}`
    : `${scsp.api}.${domain}`;

  if (scsp.protocol) {
    return `${scsp.protocol}://${fullDomain}`;
  }

  return fullDomain;
};

export const convertContentSecurityPolicy = (
  baseDomain: string,
  contentSecurityPolicy?: ResponseHeadersContentSecurityPolicy,
): aws_cloudfront.ResponseHeadersContentSecurityPolicy | undefined => {
  if (!contentSecurityPolicy) {
    return {
      contentSecurityPolicy: "default-src 'self'; object-src 'none'",
      override: true,
    };
  }

  const contentSecurityPolicyCopy: Record<string, ContentSecurityPolicyEntry[]> = {
    ...contentSecurityPolicy.contentSecurityPolicy,

    // Auto add the secure urls for s3
    // TODO: Do a better url like the one below
    // https://*.s3.${region}.amazonaws.com
    // Or even better:
    // https://${bucketName}.s3.${region}.amazonaws.com
    // even better better could be to proxy secure links with a new web proxy and it would hide the bucket.
    'connect-src': [
      ...(contentSecurityPolicy.contentSecurityPolicy['connect-src'] || []),
      'https://*.amazonaws.com',
    ],
  };

  return {
    contentSecurityPolicy: Object.keys(contentSecurityPolicyCopy)
      .map((directive) =>
        [
          directive,
          ...contentSecurityPolicyCopy[directive].map((cspe) =>
            convertContentSecurityPolicyEntryToString(baseDomain, cspe),
          ),
        ].join(' '),
      )
      .join('; '),
    override: contentSecurityPolicy.override,
  };
};

export const convertContentTypeOptions = (
  contentTypeOptions?: ResponseHeadersContentTypeOptions,
): aws_cloudfront.ResponseHeadersContentTypeOptions | undefined => {
  if (!contentTypeOptions) {
    return {
      override: true,
    };
  }

  return {
    override: contentTypeOptions.override,
  };
};

export const convertFrameOptions = (
  frameOptions?: ResponseHeadersFrameOptions,
): aws_cloudfront.ResponseHeadersFrameOptions | undefined => {
  if (!frameOptions) {
    return {
      frameOption: aws_cloudfront.HeadersFrameOption.DENY,
      override: true,
    };
  }

  const frameOptionMap = {
    [HeadersFrameOption.DENY]: aws_cloudfront.HeadersFrameOption.DENY,
    [HeadersFrameOption.SAMEORIGIN]: aws_cloudfront.HeadersFrameOption.SAMEORIGIN,
  };

  return {
    frameOption: frameOptionMap[frameOptions.frameOption],
    override: frameOptions.override,
  };
};

export const convertReferrerPolicy = (
  referrerPolicy?: ResponseHeadersReferrerPolicy,
): aws_cloudfront.ResponseHeadersReferrerPolicy | undefined => {
  if (!referrerPolicy) {
    return {
      referrerPolicy: aws_cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
      override: true,
    };
  }

  const referrerPolicyMap = {
    [HeadersReferrerPolicy.NO_REFERRER]: aws_cloudfront.HeadersReferrerPolicy.NO_REFERRER,
    [HeadersReferrerPolicy.NO_REFERRER_WHEN_DOWNGRADE]:
      aws_cloudfront.HeadersReferrerPolicy.NO_REFERRER_WHEN_DOWNGRADE,
    [HeadersReferrerPolicy.ORIGIN]: aws_cloudfront.HeadersReferrerPolicy.ORIGIN,
    [HeadersReferrerPolicy.ORIGIN_WHEN_CROSS_ORIGIN]:
      aws_cloudfront.HeadersReferrerPolicy.ORIGIN_WHEN_CROSS_ORIGIN,
    [HeadersReferrerPolicy.SAME_ORIGIN]: aws_cloudfront.HeadersReferrerPolicy.SAME_ORIGIN,
    [HeadersReferrerPolicy.STRICT_ORIGIN]: aws_cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN,
    [HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN]:
      aws_cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
    [HeadersReferrerPolicy.UNSAFE_URL]: aws_cloudfront.HeadersReferrerPolicy.UNSAFE_URL,
  };

  return {
    referrerPolicy: referrerPolicyMap[referrerPolicy.referrerPolicy],
    override: referrerPolicy.override,
  };
};

export const convertXssProtection = (
  xssProtection?: ResponseHeadersXSSProtection,
): aws_cloudfront.ResponseHeadersXSSProtection | undefined => {
  if (!xssProtection) {
    return {
      protection: true,
      modeBlock: true,
      override: true,
    };
  }

  return {
    protection: xssProtection.protection,
    modeBlock: xssProtection.modeBlock,
    override: xssProtection.override,
  };
};

export const convertSecurityHeadersFromQpqSecurityHeaders = (
  baseDomain: string,
  securityHeaders?: ResponseSecurityHeaders,
): aws_cloudfront.ResponseSecurityHeadersBehavior => {
  return {
    contentSecurityPolicy: convertContentSecurityPolicy(
      baseDomain,
      securityHeaders?.contentSecurityPolicy,
    ),
    contentTypeOptions: convertContentTypeOptions(securityHeaders?.contentTypeOptions),
    frameOptions: convertFrameOptions(securityHeaders?.frameOptions),
    referrerPolicy: convertReferrerPolicy(securityHeaders?.referrerPolicy),
    xssProtection: convertXssProtection(securityHeaders?.xssProtection),
    strictTransportSecurity: convertStrictTransportSecurity(
      securityHeaders?.strictTransportSecurity,
    ),
  };
};
