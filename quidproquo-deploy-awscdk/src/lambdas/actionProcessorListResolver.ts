import { ActionProcessorList, QPQConfig } from 'quidproquo-core';
import { QPQAWSResourceMap } from 'quidproquo-actionprocessor-awslambda';

export type ActionProcessorListResolver = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
) => ActionProcessorList;
