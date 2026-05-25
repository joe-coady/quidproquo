import {
  AiAssistantMessage,
  AiAssistantMessagePart,
  AiMessage,
  AiToolMessage,
  AiToolResultPart,
  AiUserMessage,
  AiUserMessagePart,
} from 'quidproquo-core';

import type {
  AssistantModelMessage,
  ModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from 'ai';

const mapUserPart = (part: AiUserMessagePart) => {
  if (part.type === 'text') {
    return { type: 'text' as const, text: part.text };
  }

  return {
    type: 'file' as const,
    data: new URL(part.url),
    mediaType: part.mediaType,
    filename: part.filename,
  };
};

const mapAssistantPart = (part: AiAssistantMessagePart) => {
  switch (part.type) {
    case 'text':
      return { type: 'text' as const, text: part.text };
    case 'file':
      return {
        type: 'file' as const,
        data: new URL(part.url),
        mediaType: part.mediaType,
        filename: part.filename,
      };
    case 'tool-call':
      return {
        type: 'tool-call' as const,
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input: part.input,
      };
    case 'reasoning':
      return {
        type: 'reasoning' as const,
        text: part.text,
        providerOptions: part.providerOptions as never,
      };
  }
};

const mapToolResult = (part: AiToolResultPart) => {
  const output = part.isError
    ? typeof part.output === 'string'
      ? { type: 'error-text' as const, value: part.output }
      : { type: 'error-json' as const, value: part.output as never }
    : typeof part.output === 'string'
      ? { type: 'text' as const, value: part.output }
      : { type: 'json' as const, value: part.output as never };

  return {
    type: 'tool-result' as const,
    toolCallId: part.toolCallId,
    toolName: part.toolName,
    output,
  };
};

const mapUserMessage = (message: AiUserMessage): UserModelMessage => {
  if (typeof message.content === 'string') {
    return { role: 'user', content: message.content };
  }

  return { role: 'user', content: message.content.map(mapUserPart) };
};

const mapAssistantMessage = (message: AiAssistantMessage): AssistantModelMessage => {
  if (typeof message.content === 'string') {
    return { role: 'assistant', content: message.content };
  }

  return { role: 'assistant', content: message.content.map(mapAssistantPart) };
};

const mapToolMessage = (message: AiToolMessage): ToolModelMessage => ({
  role: 'tool',
  content: message.content.map(mapToolResult),
});

export const toSdkMessages = (messages: AiMessage[]): ModelMessage[] =>
  messages.map((message) => {
    switch (message.role) {
      case 'user':
        return mapUserMessage(message);
      case 'assistant':
        return mapAssistantMessage(message);
      case 'tool':
        return mapToolMessage(message);
    }
  });
