---
title: askEventDocAiProcessSend
description: The backend chat turn — persist the user message, stream the model's reply to the UI, fold it into durable segments, and save.
---

# askEventDocAiProcessSend

Runs one conversational turn on the backend. It appends the user's message to the chat history, then streams the assistant's reply through [askAiPromptStream](../../core/ai/ask-ai-prompt-stream.md) — dispatching each stream part to the browser live — folding each completed reply into durable segments and saving it. If a round stops with `finishReason: toolCalls` (the underlying step limit cut it off while the model still wanted to act), it automatically resends the updated history so the model continues the same turn, up to a bounded number of rounds. Once a round finishes naturally, it bumps the chat to the top of the list and returns. This is the handler behind the `ChatSend` websocket method (`onChatSend`).

- Built from [askConfigGetGlobal](../../core/config/ask-config-get-global.md), [askAiPromptStream](../../core/ai/ask-ai-prompt-stream.md), [askStreamMap](../../core/stream/ask-stream-map.md), the history/list helpers, and the `askUIEventDocAi*` stream dispatches.

```typescript
import { askEventDocAiProcessSend } from 'quidproquo-features';

// From the ChatSend handler — docId is read from the trusted session context.
export function* askOnSend(docId: string, chatId: string, message: string) {
  return yield* askEventDocAiProcessSend(docId, chatId, message);
}
```

## Signature

```typescript
function* askEventDocAiProcessSend(
  docId: string,
  chatId: string,
  message: string,
  attachments?: EventDocAiAttachment[],
): AskResponse<EventDocAiChatSendResult>;
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `docId` | `string` | – | The trusted document the chat is scoped to (from session context). |
| `chatId` | `string` | – | The chat to append this turn to. |
| `message` | `string` | – | The user's message text. |
| `attachments` | `EventDocAiAttachment[]` | `[]` | Document assets to attach — each `{ assetId, filename, mediaType }`. Validated against `docId` before the model sees them. |

## Returns

`EventDocAiChatSendResult` — `{ complete: true }`. The reply content is **not** in the return value; it is delivered to the UI during the turn via state dispatches (see below).

## What one turn does

1. Reads the AI name, model, and reasoning budget from the feature's globals, and resolves the system prompt — freshest source first: the configured `systemPromptGenerator` inline function (run per-turn with `{ docId }` so it can carry live document state), else the static `systemPrompt`, else a built-in default. The prompt is never persisted.
2. [Validates the attachments](./ask-event-doc-ai-attachments-validate.md) against the document's storage drive and trusted `docId`.
3. Loads the chat history, appends the new user message (attachments first, then text), and **saves** immediately — so a refresh mid-reply still shows the question.
4. Runs one or more rounds (bounded, currently up to 20):
   1. Streams the reply with [askAiPromptStream](../../core/ai/ask-ai-prompt-stream.md). File segments in the history become drive-referenced file parts (no URLs), which the action processor resolves to contents at prompt time. Tools do **not** receive `docId` from the model — executors inherit the session context and read the trusted id there. From the second round on, a transport-only nudge message (never saved to history) is appended so the conversation doesn't end on an assistant turn.
   2. Maps over the stream with [askStreamMap](../../core/stream/ask-stream-map.md), dispatching each part to the UI as it arrives (the live typing view) and collecting the parts.
   3. Folds the collected parts into durable segments (`text`/`reasoning` deltas merged, tool calls paired with results). A stream that produced no content (e.g. it errored before any text) saves no assistant message.
   4. If there are segments, **saves** the finalized assistant message and dispatches it to the UI as the finalized message.
   5. Clears the UI's now-superseded live-stream buffer.
   6. If the round's [`finishReason`](../../core/ai/ask-ai-prompt-stream.md#aistreamfinishreasonenum) was `toolCalls` (halted early) and it produced segments, loops back to stream another round from the updated history; otherwise stops.
5. Touches the chat (bumps `updatedAt`) and returns `{ complete: true }`.

Steps 4.ii–4.v use the `askUIEventDocAiAppendStreamChunk`, `askUIEventDocAiAppendChatMessage`, and `askUIEventDocAiClearStream` UI actions — the client renders the reply from those dispatches while this request is still in flight, then reconciles to the finalized message. Because rounds can repeat, the UI may see more than one finalized assistant message appended for what is presented as a single turn.

## The chat model

Stream parts are **transport-only** — the raw `AiStreamPart`s dispatched live never persist. Only the folded `EventDocAiMessageSegment[]` are written to the chat's history file. A chat's messages are therefore always in the durable segment form (`text`, `reasoning`, `file`, `tool-use`), while the "typing" experience is a separate stream of parts the UI buffers and then discards once the finalized message arrives.

## Related

- [askAiPromptStream](../../core/ai/ask-ai-prompt-stream.md) — the streamed prompt this drives; [askStreamMap](../../core/stream/ask-stream-map.md) consumes it.
- [askEventDocAiAttachmentsValidate](./ask-event-doc-ai-attachments-validate.md) — the attachment guard.
- [askEventDocAiChatHistoryLoad / Save](./ask-event-doc-ai-chat-history-load.md) — the history read/write.
- [askEventDocAiChatTouch](./ask-event-doc-ai-chat-list.md) — bumps the chat afterwards.
- [askEventDocAiChatSendRequest](./ask-event-doc-ai-chat-requests.md) — the frontend request this handles.
- [askEventDocAiSendMessage](./ask-event-doc-ai-send-message.md) — the client story that issues the send.
- [defineEventDocAi](../../../config/features/event-doc-ai.md) — configures the model, prompt, tools, and reasoning budget this reads.
