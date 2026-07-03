// Input handed to a `systemPromptGenerator` inline function (registered via
// defineEventDocAi) on every chat turn. The docId is the TRUSTED id of the
// document the chat is scoped to (supplied by the send flow, never the model),
// so generators can safely load that document's state into the prompt.
export type EventDocAiSystemPromptInput = {
  docId: string;
};
