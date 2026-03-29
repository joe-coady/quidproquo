export interface AiStreamTextDelta {
  type: 'text-delta';
  text: string;
}

export interface AiStreamToolCall {
  type: 'tool-call';
  toolName: string;
  input: unknown;
}

export interface AiStreamToolResult {
  type: 'tool-result';
  toolName: string;
  output: unknown;
}

export type AiStreamPart = AiStreamTextDelta | AiStreamToolCall | AiStreamToolResult;
