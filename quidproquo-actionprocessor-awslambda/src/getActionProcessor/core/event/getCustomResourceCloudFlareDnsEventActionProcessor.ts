import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  getServiceEntry,
} from 'quidproquo-core';

import {
  CloudFlareDnsDeployEvent,
  CloudFlareDnsDeployEventEnum,
  CloudFlareDnsDeployEventResponse,
  CloudFlareDnsEntries,
  CloudFlareDnsEntry,
  qpqWebServerUtils,
} from 'quidproquo-webserver';

import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';

import { getDomainValidationOptions } from '../../../logic/acm/getDomainValidationOptions';
import { findMatchingCertificates } from '../../../logic/acm/findMatchingCertificates';

type EventInput = [CloudFormationCustomResourceEvent, Context];
type EventOutput = void;

// Internals
type InternalEventInput = CloudFlareDnsDeployEvent;
type InternalEventOutput = CloudFlareDnsDeployEventResponse;

type AutoRespondResult = boolean;
type MatchResult = MatchStoryResult<any, any>;

// // TODO: Don't use Globals like this
const GLOBAL_CERT_ARN = process.env.certificateArn!;
const GLOBAL_CERT_DOMAIN = process.env.certificateDomain!;
const GLOBAL_CERT_REGION = process.env.certificateRegion!;

const awsToQpqEventTypeMap = {
  Create: CloudFlareDnsDeployEventEnum.Create,
  Update: CloudFlareDnsDeployEventEnum.Update,
  Delete: CloudFlareDnsDeployEventEnum.Delete,
};

const getProcessTransformEventParams = (
  siteDnsBase: string,
): EventTransformEventParamsActionProcessor<EventInput, InternalEventInput> => {
  return async ({ eventParams: [event, context] }) => {
    // Get all the certs that need to be added to the cloud flare
    const certArns = [
      ...(await findMatchingCertificates(GLOBAL_CERT_DOMAIN, GLOBAL_CERT_REGION)),
      GLOBAL_CERT_ARN,
    ].filter(Boolean);

    const certDomains = await Promise.all(
      certArns.map((arn) => getDomainValidationOptions(arn, GLOBAL_CERT_REGION)),
    );

    // Remove trailing dot from keys
    const dnsEntriesWithTrimmedKeys = Object.entries({
      ...event.ResourceProperties.dnsEntries,
      ...certDomains.reduce(
        (acc, certDomain) => ({
          ...acc,
          ...certDomain,
        }),
        {},
      ),
    }).reduce<CloudFlareDnsEntries>((acc, [key, value]) => {
      const trimmedKey = key.endsWith('.') ? key.slice(0, -1) : key;
      acc[trimmedKey] = value as CloudFlareDnsEntry;
      return acc;
    }, {});

    const transformedEventParams: InternalEventInput = {
      siteDns: siteDnsBase,
      RequestType: awsToQpqEventTypeMap[event.RequestType],
      apiSecretName: event.ResourceProperties.apiSecretName,
      dnsEntries: dnsEntriesWithTrimmedKeys,
      oldDnsEntries: (event as any)?.OldResourceProperties?.dnsEntries,
    };

    console.log('transformedEventParams', JSON.stringify(transformedEventParams, null, 2));

    return actionResult(transformedEventParams);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  InternalEventOutput,
  InternalEventInput,
  EventOutput
> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    // always success
    return actionResult<EventOutput>(void 0);
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<InternalEventInput, MatchResult, AutoRespondResult> => {
  return async (payload) => {
    // always allow
    return actionResult(false);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  return async (payload) => {
    return actionResult<MatchResult>({
      src: getServiceEntry('cloudFlare', 'cloudFlare', 'onDeploy'),
      runtime: 'onDeploy',
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  const [siteDnsConfig] = qpqWebServerUtils.getDnsConfigs(qpqConfig);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(siteDnsConfig.dnsBase),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
