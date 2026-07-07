import { buildTestQpqConfig, ErrorTypeEnum, EventActionType, noopDynamicModuleLoader, resolveActionResult } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { invokeProcessor } from '../../../../../testing/testProcessorRuntime';
import { getEventTransformResponseResultActionProcessor } from './getEventTransformResponseResultActionProcessor';

const invoke = async (qpqEventRecordResponses: any) => {
  const processors = await getEventTransformResponseResultActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader);
  const process = processors[EventActionType.TransformResponseResult];
  return invokeProcessor(process, { eventParams: [{ headers: {} }], qpqEventRecordResponses } as any);
};

describe('getEventTransformResponseResultActionProcessor (express)', () => {
  it('maps a success record onto the express response, merging CORS headers', async () => {
    const result = await invoke([{ success: true, result: { status: 201, body: 'created', isBase64Encoded: false, headers: { 'x-custom': 'y' } } }]);

    const output = resolveActionResult(result);
    expect(output.statusCode).toBe(201);
    expect(output.body).toBe('created');
    expect(output.isBase64Encoded).toBe(false);
    expect(output.headers['x-custom']).toBe('y');
    expect(output.headers['Access-Control-Allow-Origin']).toBeDefined();
  });

  it('defaults an empty body when the success record has none', async () => {
    const result = await invoke([{ success: true, result: { status: 200, isBase64Encoded: false } }]);

    expect(resolveActionResult(result).body).toBe('');
  });

  it('maps a NotFound error record to a 404 response', async () => {
    const result = await invoke([{ success: false, error: { errorType: ErrorTypeEnum.NotFound, errorText: 'nope' } }]);

    const output = resolveActionResult(result);
    expect(output.statusCode).toBe(404);
    expect(output.body).toContain(ErrorTypeEnum.NotFound);
  });

  it('maps an Unauthorized error record to a 401 response', async () => {
    const result = await invoke([{ success: false, error: { errorType: ErrorTypeEnum.Unauthorized, errorText: 'no' } }]);

    expect(resolveActionResult(result).statusCode).toBe(401);
  });

  it('maps an unknown error type to a 500 response', async () => {
    const result = await invoke([{ success: false, error: { errorType: 'SomethingElse', errorText: 'boom' } }]);

    expect(resolveActionResult(result).statusCode).toBe(500);
  });
});
