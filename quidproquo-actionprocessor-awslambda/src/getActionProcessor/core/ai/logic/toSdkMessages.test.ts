import { AiMessage } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { toSdkMessages } from './toSdkMessages';

describe('toSdkMessages', () => {
  it('passes a string user message through', () => {
    expect(toSdkMessages([{ role: 'user', content: 'hello' }] as AiMessage[])).toEqual([{ role: 'user', content: 'hello' }]);
  });

  it('maps user text and file parts', () => {
    const [message] = toSdkMessages([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'look' },
          { type: 'file', url: 'https://x/y.png', mediaType: 'image/png', filename: 'y.png' },
        ],
      },
    ] as AiMessage[]);

    expect(message.role).toBe('user');
    const content = message.content as Array<Record<string, unknown>>;
    expect(content[0]).toEqual({ type: 'text', text: 'look' });
    expect(content[1].type).toBe('file');
    expect(content[1].mediaType).toBe('image/png');
    expect((content[1].data as URL).href).toBe('https://x/y.png');
  });

  it('passes a string assistant message through', () => {
    expect(toSdkMessages([{ role: 'assistant', content: 'hi there' }] as AiMessage[])).toEqual([{ role: 'assistant', content: 'hi there' }]);
  });

  it('maps assistant text, file, tool-call and reasoning parts', () => {
    const [message] = toSdkMessages([
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'sure' },
          { type: 'file', url: 'https://x/a.pdf', mediaType: 'application/pdf', filename: 'a.pdf' },
          { type: 'tool-call', toolCallId: 'c1', toolName: 'calc', input: { a: 1 } },
          { type: 'reasoning', text: 'because', providerOptions: { foo: 'bar' } },
        ],
      },
    ] as AiMessage[]);

    const content = message.content as Array<Record<string, unknown>>;
    expect(content[0]).toEqual({ type: 'text', text: 'sure' });
    expect(content[1].type).toBe('file');
    expect((content[1].data as URL).href).toBe('https://x/a.pdf');
    expect(content[2]).toEqual({ type: 'tool-call', toolCallId: 'c1', toolName: 'calc', input: { a: 1 } });
    expect(content[3]).toEqual({ type: 'reasoning', text: 'because', providerOptions: { foo: 'bar' } });
  });

  it.each([
    ['string success', 'ok', false, { type: 'text', value: 'ok' }],
    ['json success', { n: 1 }, false, { type: 'json', value: { n: 1 } }],
    ['string error', 'fail', true, { type: 'error-text', value: 'fail' }],
    ['json error', { code: 9 }, true, { type: 'error-json', value: { code: 9 } }],
  ])('maps a tool result with %s output', (_label: string, output: unknown, isError: boolean, expectedOutput: unknown) => {
    const [message] = toSdkMessages([
      { role: 'tool', content: [{ type: 'tool-result', toolCallId: 'c1', toolName: 'calc', output, isError }] },
    ] as AiMessage[]);

    expect(message.role).toBe('tool');
    expect((message.content as Array<Record<string, unknown>>)[0]).toEqual({
      type: 'tool-result',
      toolCallId: 'c1',
      toolName: 'calc',
      output: expectedOutput,
    });
  });
});
