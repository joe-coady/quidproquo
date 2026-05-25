export interface AiTextPart {
  type: 'text';
  text: string;
}

export interface AiFilePart {
  type: 'file';
  url: string;
  mediaType: string;
  filename?: string;
}

export interface AiToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export interface AiReasoningPart {
  type: 'reasoning';
  text: string;
  providerOptions?: Record<string, Record<string, unknown>>;
}

export interface AiToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  output: unknown;
  isError?: boolean;
}

export type AiUserMessagePart = AiTextPart | AiFilePart;
export type AiAssistantMessagePart = AiTextPart | AiFilePart | AiToolCallPart | AiReasoningPart;

export type AiUserMessage = {
  role: 'user';
  content: string | AiUserMessagePart[];
};

export type AiAssistantMessage = {
  role: 'assistant';
  content: string | AiAssistantMessagePart[];
};

export type AiToolMessage = {
  role: 'tool';
  content: AiToolResultPart[];
};

export type AiMessage = AiUserMessage | AiAssistantMessage | AiToolMessage;
