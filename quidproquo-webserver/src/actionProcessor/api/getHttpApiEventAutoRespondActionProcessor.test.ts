import {
  actionResult,
  buildActionProcessorList,
  buildTestQpqConfig,
  buildTestStorySession,
  createStreamRegistry,
  createStubLogger,
  EventActionType,
  noopDynamicModuleLoader,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { RouteAuthValidationActionType } from '../../actions/routeAuthValidation';
import { defineDns } from '../../config/settings/dns';
import { RouteOptions } from '../../config/settings/route';
import { FileUploadErrorTypeEnum, HTTPEvent } from '../../types/HTTPEvent';
import { getHttpApiEventAutoRespondActionProcessor } from './getHttpApiEventAutoRespondActionProcessor';

const qpqConfig = buildTestQpqConfig([defineDns('example.com')], { environment: 'production' });

const invoke = async (qpqEventRecord: Partial<HTTPEvent>, config: RouteOptions, processors: Record<string, any> = {}) => {
  const map = await getHttpApiEventAutoRespondActionProcessor(qpqConfig, noopDynamicModuleLoader);
  const processor = map[EventActionType.AutoRespond];

  return processor(
    { qpqEventRecord, matchResult: { config } },
    buildTestStorySession(),
    buildActionProcessorList(processors),
    createStubLogger(),
    () => {},
    noopDynamicModuleLoader,
    createStreamRegistry(),
  );
};

describe('getHttpApiEventAutoRespondActionProcessor', () => {
  it('auto-responds 200 with cors headers for OPTIONS preflight', async () => {
    const [response] = await invoke({ method: 'OPTIONS', headers: { origin: 'https://example.com' } }, {});

    expect(response.status).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('https://example.com');
  });

  it('passes through (null) when the route needs no auth', async () => {
    const [response] = await invoke({ method: 'GET', headers: {} }, {});

    expect(response).toBeNull();
  });

  it('responds 401 when auth validation fails', async () => {
    const [response] = await invoke(
      { method: 'GET', headers: {} },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResult({ wasValid: false }) },
    );

    expect(response.status).toBe(401);
  });

  it('responds with the mapped status and error body when the record carries a file upload error', async () => {
    const [response] = await invoke(
      {
        method: 'POST',
        headers: { origin: 'https://example.com' },
        fileUploadError: { errorType: FileUploadErrorTypeEnum.fileTooLarge, message: 'File "big.bin" exceeds the maximum file size of 10 bytes' },
      },
      {},
    );

    expect(response.status).toBe(413);
    expect(JSON.parse(response.body)).toEqual({
      errorType: FileUploadErrorTypeEnum.fileTooLarge,
      errorText: 'File "big.bin" exceeds the maximum file size of 10 bytes',
    });
    expect(response.headers['Access-Control-Allow-Origin']).toBe('https://example.com');
  });

  it('responds 415 for a disallowed mime type upload error', async () => {
    const [response] = await invoke(
      { method: 'POST', headers: {}, fileUploadError: { errorType: FileUploadErrorTypeEnum.disallowedMimeType, message: 'nope' } },
      {},
    );

    expect(response.status).toBe(415);
  });

  it('prefers the 401 over the file upload error when auth fails', async () => {
    const [response] = await invoke(
      { method: 'POST', headers: {}, fileUploadError: { errorType: FileUploadErrorTypeEnum.fileTooLarge, message: 'too big' } },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResult({ wasValid: false }) },
    );

    expect(response.status).toBe(401);
  });
});
