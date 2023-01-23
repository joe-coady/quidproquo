import { ActionProcessorList, QPQConfig } from 'quidproquo-core';

export type ActionProcessorListResolver = (qpqConfig: QPQConfig) => ActionProcessorList;
