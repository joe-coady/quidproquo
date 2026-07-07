import {
  buildTestQpqConfig,
  ClaudeAiActionType,
  ClaudeAiMessagesApiErrorTypeEnum,
  ErrorTypeEnum,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getClaudeAiMessagesApiActionProcessor } from './getClaudeAiMessagesApiActionProcessor';

const { messagesCreate, MockAuthenticationError } = vi.hoisted(() => {
  class MockAuthenticationError extends Error {}

  return { messagesCreate: vi.fn(), MockAuthenticationError };
});

vi.mock('@anthropic-ai/sdk', () => {
  class Anthropic {
    public messages = { create: messagesCreate };

    constructor(public options: { apiKey?: string }) {}
  }

  // The processor instanceof-checks every SDK error class it imports, so the mock
  // must export each one (unused classes still need to resolve as named exports).
  class APIConnectionError extends Error {}
  class BadRequestError extends Error {}
  class InternalServerError extends Error {}
  class PermissionDeniedError extends Error {}
  class RateLimitError extends Error {}
  class UnprocessableEntityError extends Error {}

  return {
    default: Anthropic,
    AuthenticationError: MockAuthenticationError,
    APIConnectionError,
    BadRequestError,
    InternalServerError,
    PermissionDeniedError,
    RateLimitError,
    UnprocessableEntityError,
  };
});

describe('getClaudeAiMessagesApiActionProcessor', () => {
  const body = { model: 'claude', max_tokens: 1, messages: [] } as any;

  afterEach(() => {
    vi.restoreAllMocks();
    messagesCreate.mockReset();
  });

  const resolve = async () =>
    (await getClaudeAiMessagesApiActionProcessor(buildTestQpqConfig(), async () => null))[ClaudeAiActionType.MessagesApi] as (
      p: any,
      ...rest: any[]
    ) => Promise<any>;

  it('returns the created message on success', async () => {
    const message = { id: 'msg_1', content: [] };
    messagesCreate.mockResolvedValue(message);
    const processor = await resolve();

    const result = await processor({ body, apiKey: 'sk-test' }, undefined as any);

    expect(messagesCreate).toHaveBeenCalledWith(body);
    expect(resolveActionResult(result)).toEqual(message);
  });

  it('maps an authentication error to Unauthorized', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    messagesCreate.mockRejectedValue(new MockAuthenticationError('bad key'));
    const processor = await resolve();

    const result = await processor({ body, apiKey: 'sk-test' }, undefined as any);

    expect(resolveActionResultError(result)).toEqual({
      errorType: ClaudeAiMessagesApiErrorTypeEnum.Unauthorized,
      errorText: 'Invalid API key.',
      errorStack: undefined,
    });
  });

  it('maps a generic error to its message', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    messagesCreate.mockRejectedValue(new Error('rate limited'));
    const processor = await resolve();

    const result = await processor({ body, apiKey: 'sk-test' }, undefined as any);

    expect(resolveActionResultError(result)).toEqual({ errorType: ErrorTypeEnum.GenericError, errorText: 'rate limited', errorStack: undefined });
  });

  it('maps a non-error rejection to a default message', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    messagesCreate.mockRejectedValue('boom');
    const processor = await resolve();

    const result = await processor({ body, apiKey: 'sk-test' }, undefined as any);

    expect(resolveActionResultError(result)).toEqual({
      errorType: ErrorTypeEnum.GenericError,
      errorText: 'An error occurred while processing your request.',
      errorStack: undefined,
    });
  });
});
