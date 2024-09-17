import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';
import { CloudFrontRequestEvent } from 'aws-lambda';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';
import { getCloudFrontOriginRequestEventProcessor } from '../getActionProcessor';

export const getCloudFrontRequestEvent_originRequest = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<CloudFrontRequestEvent>(
    QpqRuntimeType.EVENT_SEO_OR,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getCloudFrontOriginRequestEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
  );
