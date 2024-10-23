import { CloudFrontRequestEvent } from 'aws-lambda';
import { DynamicModuleLoader, QPQConfig, QpqRuntimeType } from 'quidproquo-core';

import { getCloudFrontOriginRequestEventProcessor } from '../getActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

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
