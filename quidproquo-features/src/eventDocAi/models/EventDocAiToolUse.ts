// One tool invocation within a message: the call input paired with its result
// (output is absent while the call is still running in a live stream).
export type EventDocAiToolUse = {
  toolName: string;
  input: unknown;
  output?: unknown;
};
