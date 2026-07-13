import {
  actionResult,
  actionResultError,
  buildActionProcessorList,
  buildTestQpqConfig,
  buildTestStorySession,
  createStreamRegistry,
  createStubLogger,
  ErrorTypeEnum,
  EventActionType,
  noopDynamicModuleLoader,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { ApiKeyValidationActionType } from '../../actions/apiKeyValidation';
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

  it('passes through (null) when auth validation succeeds', async () => {
    const [response] = await invoke(
      { method: 'GET', headers: {} },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResult({ wasValid: true, userId: 'u1' }) },
    );

    expect(response).toBeNull();
  });

  it('responds 401 when the decode action itself errors (fails closed)', async () => {
    const [response] = await invoke(
      { method: 'GET', headers: {} },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResultError(ErrorTypeEnum.GenericError, 'decode blew up') },
    );

    expect(response.status).toBe(401);
  });

  it('responds 401 when the route requires an api key and none is presented (default deny)', async () => {
    // Validate is mocked permissive to prove the missing header alone denies the request
    const [response] = await invoke(
      { method: 'GET', headers: {} },
      { routeAuthSettings: { apiKeys: [{ name: 'primary' }] } },
      { [ApiKeyValidationActionType.Validate]: async () => actionResult(true) },
    );

    expect(response.status).toBe(401);
  });

  it('responds 401 when the presented api key does not validate', async () => {
    const [response] = await invoke(
      { method: 'GET', headers: { 'x-api-key': 'wrong' } },
      { routeAuthSettings: { apiKeys: [{ name: 'primary' }] } },
      { [ApiKeyValidationActionType.Validate]: async () => actionResult(false) },
    );

    expect(response.status).toBe(401);
  });

  it('passes through (null) when the presented api key validates', async () => {
    const [response] = await invoke(
      { method: 'GET', headers: { 'x-api-key': 'right' } },
      { routeAuthSettings: { apiKeys: [{ name: 'primary' }] } },
      { [ApiKeyValidationActionType.Validate]: async () => actionResult(true) },
    );

    expect(response).toBeNull();
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
