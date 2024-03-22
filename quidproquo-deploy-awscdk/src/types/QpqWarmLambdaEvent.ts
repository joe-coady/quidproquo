export type QpqWarmLambdaEvent = { qpqWarm: boolean };

export type QpqFunctionExecutionEvent<T> = QpqWarmLambdaEvent | T;
