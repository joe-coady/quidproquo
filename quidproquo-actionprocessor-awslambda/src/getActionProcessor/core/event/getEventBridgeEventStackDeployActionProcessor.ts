import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  DeployEvent,
  DeployEventResponse,
  DeployEventStatusTypeEnum,
  DeployEventType,
  qpqCoreUtils,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import { getApiStackName, getInfStackName, getWebStackName } from '../../../awsNamingUtils';

import { EventBridgeEvent, Context } from 'aws-lambda';

interface CloudFormationEventDetail {
  'stack-id': string;
  'status-details': {
    status: string;
    'status-reason': string;
  };
}

type EventInput = [EventBridgeEvent<"CloudFormation Stack Status Change", CloudFormationEventDetail>, Context];
type EventOutput = void;

// Internals
type InternalEventInput = DeployEvent;
type InternalEventOutput = DeployEventResponse;

type AutoRespondResult = boolean;
type MatchResult = MatchStoryResult<any, any>;

const deployTypeMap: Record<string, DeployEventStatusTypeEnum> = {
  'UPDATE_COMPLETE': DeployEventStatusTypeEnum.Update,
  'CREATE_COMPLETE': DeployEventStatusTypeEnum.Create,
  'DELETE_COMPLETE': DeployEventStatusTypeEnum.Delete,
};

// TODO: Don't use Globals like this
const GLOBAL_DEPLOY_EVENT_NAME = process.env.deployEventConfigName!;

const getProcessTransformEventParams = (qpqConfig: QPQConfig): EventTransformEventParamsActionProcessor<EventInput, InternalEventInput> => {
  return async ({ eventParams: [event, context] }) => {
    const status = event.detail['status-details'].status || '';
    const stackId = event.detail['stack-id'];

    const regex = /:stack\/([^\/]+)/;
    const match = stackId.match(regex);

    const stackName = match && match[1] ? match[1] : '';

    const transformedEventParams: InternalEventInput = {
      deployEventType: DeployEventType.Unknown,
      deployEventStatusType:  deployTypeMap[status] || DeployEventStatusTypeEnum.Unknown,
    };

    if (stackName === getInfStackName(qpqConfig)) {
      transformedEventParams.deployEventType = DeployEventType.Infrastructure;
    } else if (stackName === getApiStackName(qpqConfig)) {
      transformedEventParams.deployEventType = DeployEventType.Api;
    } else if (stackName === getWebStackName(qpqConfig)) {
      transformedEventParams.deployEventType = DeployEventType.Web;
    }

    console.log("transformedEventParams", transformedEventParams);

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
): EventAutoRespondActionProcessor<
  InternalEventInput,
  MatchResult,
  AutoRespondResult
> => {
  return async ({ transformedEventParams }) => {
    // exit if we don't know what deploy type this is, probably another stack
    return actionResult(
      transformedEventParams.deployEventType === DeployEventType.Unknown ||
      transformedEventParams.deployEventStatusType === DeployEventStatusTypeEnum.Unknown
    );
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  const deployConfig = qpqCoreUtils.getDeployEventConfigs(qpqConfig).find(c => c.name === GLOBAL_DEPLOY_EVENT_NAME);
  return async (payload) => {
    if (!deployConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find deploy event config ${GLOBAL_DEPLOY_EVENT_NAME}`);
    }

    return actionResult<MatchResult>({
      src: deployConfig.src.src,
      runtime: deployConfig.src.runtime
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(qpqConfig),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
