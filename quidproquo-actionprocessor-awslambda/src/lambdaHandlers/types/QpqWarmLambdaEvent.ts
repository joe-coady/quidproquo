import { SNSEvent } from 'aws-lambda';

export type QpqWarmLambdaEvent = { qpqWarm: boolean };

export type QpqFunctionExecutionEvent<T> = SNSEvent | T;
