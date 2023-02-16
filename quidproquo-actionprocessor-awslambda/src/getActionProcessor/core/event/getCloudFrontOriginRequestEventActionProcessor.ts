import {
  EventActionType,
  QPQConfig,
  qpqCoreUtils,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  HTTPMethod,
} from 'quidproquo-core';

import {
  SeoQPQWebServerConfigSetting,
  SeoEvent,
  SeoEventResponse,
  qpqWebServerUtils,
  SeoEventRouteParams,
} from 'quidproquo-webserver';

import { matchUrl } from '../../../awsLambdaUtils';

import { CloudFrontRequestEvent, Context, CloudFrontRequestResult } from 'aws-lambda';

export type CloudFrontOriginMatchStoryResult = MatchStoryResult<
  SeoEventRouteParams,
  SeoQPQWebServerConfigSetting
>;

const getProcessTransformEventParams = (
  qpqConfig: QPQConfig,
): EventTransformEventParamsActionProcessor<[CloudFrontRequestEvent, Context], SeoEvent<any>> => {
  return async ({ eventParams: [cloudFrontRequestEvent, context] }) => {
    const cfRecordRequest = cloudFrontRequestEvent.Records[0].cf.request;

    const headers = Object.keys(cfRecordRequest.headers).reduce(
      (acc, header) => ({ ...acc, [header]: cfRecordRequest.headers[header][0].value }),
      {},
    );

    return actionResult({
      domain: qpqWebServerUtils.getBaseDomainName(qpqConfig),
      body: cfRecordRequest.body,
      correlation: context.awsRequestId,
      method: cfRecordRequest.method as HTTPMethod,
      path: cfRecordRequest.uri,
      sourceIp: cfRecordRequest.clientIp,
      headers: headers,
      // TODO: query string support
      query: {},
    });
  };
};

const getProcessTransformResponseResult = (
  configs: QPQConfig,
): EventTransformResponseResultActionProcessor<
  SeoEventResponse,
  SeoEvent<any>,
  SeoEventResponse
> => {
  return async ({ response }) => {
    return actionResult<SeoEventResponse>(response);
  };
};

const getProcessAutoRespond = (): EventAutoRespondActionProcessor<
  SeoEvent<any>,
  CloudFrontOriginMatchStoryResult
> => {
  return async (payload) => {
    return actionResult(null);
  };
};

const getProcessMatchStory = (
  seoConfigs: SeoQPQWebServerConfigSetting[],
): EventMatchStoryActionProcessor<SeoEvent<any>, CloudFrontOriginMatchStoryResult> => {
  return async (payload) => {
    /// Sort the routes by string length
    // Note: We may need to filter variable routes out {} as the variables are length independent
    const sortedSeoConfigs = seoConfigs.sort((a: any, b: any) => {
      if (a.path.length < b.path.length) return -1;
      if (a.path.length > b.path.length) return 1;
      return 0;
    });

    // Find the most relevant match
    const matchedSeoConfig = sortedSeoConfigs
      .map((r) => ({
        match: matchUrl(r.path, payload.transformedEventParams.path),
        route: r,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedSeoConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, 'seo not found');
    }

    return actionResult<CloudFrontOriginMatchStoryResult>({
      src: matchedSeoConfig.route.src,
      runtime: matchedSeoConfig.route.runtime,
      runtimeOptions: matchedSeoConfig.match.params || {},
      config: matchedSeoConfig.route,
    });
  };
};

export default (config: QPQConfig) => {
  const seoConfigs = qpqWebServerUtils.getAllSeo(config);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(config),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(config),
    [EventActionType.AutoRespond]: getProcessAutoRespond(),
    [EventActionType.MatchStory]: getProcessMatchStory(seoConfigs),
  };
};
