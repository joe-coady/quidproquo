import {
  type AiModel,
  type AiStreamFinish,
  AiStreamFinishReasonEnum,
  type AiStreamPart,
  AiStreamPartType,
  askAiPromptStream,
  askConfigGetGlobal,
  askInlineFunctionExecute,
  AskResponse,
  askStreamMap,
} from 'quidproquo-core';

import { EVENT_DOC_STORAGE_DRIVE_GLOBAL } from '../../eventDoc';
import {
  EVENT_DOC_AI_MODEL_GLOBAL,
  EVENT_DOC_AI_NAME_GLOBAL,
  EVENT_DOC_AI_REASONING_BUDGET_GLOBAL,
  EVENT_DOC_AI_SYSTEM_PROMPT_GENERATOR_GLOBAL,
  EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL,
} from '../constants/eventDocAiGlobalNames';
import { askEventDocAiChatHistoryLoad } from '../data/askEventDocAiChatHistoryLoad';
import { askEventDocAiChatHistorySave } from '../data/askEventDocAiChatHistorySave';
import { askEventDocAiChatTouch } from '../data/askEventDocAiChatTouch';
import type { EventDocAiAttachment, EventDocAiChatMessage, EventDocAiChatSendResult, EventDocAiSystemPromptInput } from '../models';
import {
  askUIEventDocAiAppendChatMessage,
  askUIEventDocAiAppendStreamChunk,
  askUIEventDocAiClearStream,
  chatMessagesToAiMessages,
  makeEventDocAiUserMessage,
  mergeStreamParts,
} from '../module';
import { askEventDocAiAttachmentsValidate } from './askEventDocAiAttachmentsValidate';

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant. Use tools when appropriate.';

// Safety cap on resume rounds. With the processor stopping after every step
// (stepCountIs(1)) this bounds a turn at roughly this many model calls.
const MAX_CONTINUATION_ROUNDS = 20;

// Anthropic rejects a conversation ending on an assistant turn when extended
// thinking is enabled (it reads as a response prefill), and resume rounds
// always end on the just-saved assistant message. This nudge keeps the final
// turn a user message. Transport-only: it is never saved to the chat history.
const CONTINUATION_NUDGE = 'Continue the task. Your previous tool calls and their results are recorded above.';

// The Finish part's reason says how the underlying AI SDK loop ended: `stop`
// means the model finished its answer; `toolCalls` means the step limit cut
// it off while it still wanted to keep acting, so the turn should be resumed.
const getFinishReason = (parts: AiStreamPart[]): AiStreamFinishReasonEnum | undefined => {
  const finishPart = parts.find((part): part is AiStreamFinish => part.type === AiStreamPartType.Finish);
  return finishPart?.finishReason;
};

// The turn's system prompt, freshest source first: the configured generator
// inline function (built per-turn so it can carry live document state), else
// the static configured prompt, else the default. Never persisted — the chat
// history stores messages only.
function* askEventDocAiSystemPromptResolve(docId: string): AskResponse<string> {
  const generatorFn = yield* askConfigGetGlobal<string>(EVENT_DOC_AI_SYSTEM_PROMPT_GENERATOR_GLOBAL);

  const generatedPrompt = generatorFn ? yield* askInlineFunctionExecute<string, EventDocAiSystemPromptInput>(generatorFn, { docId }) : '';

  const configuredPrompt = yield* askConfigGetGlobal<string>(EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL);

  return generatedPrompt || configuredPrompt || DEFAULT_SYSTEM_PROMPT;
}

// One conversational turn. Stream parts are a TRANSPORT-ONLY concept: each part
// is dispatched to the UI as it arrives (the live typing view), then the
// completed reply is folded into durable segments, saved, dispatched as the
// finalized message, and the UI's part buffer is cleared.
export function* askEventDocAiProcessSend(
  docId: string,
  chatId: string,
  message: string,
  attachments: EventDocAiAttachment[] = [],
): AskResponse<EventDocAiChatSendResult> {
  const aiName = yield* askConfigGetGlobal<string>(EVENT_DOC_AI_NAME_GLOBAL);
  const model = yield* askConfigGetGlobal<AiModel>(EVENT_DOC_AI_MODEL_GLOBAL);
  const reasoningBudgetTokens = yield* askConfigGetGlobal<number>(EVENT_DOC_AI_REASONING_BUDGET_GLOBAL);
  const systemPrompt = yield* askEventDocAiSystemPromptResolve(docId);

  // Attachments are doc assets — they live on the collection's storage drive
  // (uploaded via the eventDoc asset routes), not the chat-history drive.
  const docStorageDrive = yield* askConfigGetGlobal<string>(EVENT_DOC_STORAGE_DRIVE_GLOBAL);

  yield* askEventDocAiAttachmentsValidate(docStorageDrive, docId, attachments);

  const fullHistory = [...(yield* askEventDocAiChatHistoryLoad(docId, chatId)), makeEventDocAiUserMessage(message, attachments)];

  yield* askEventDocAiChatHistorySave(docId, chatId, fullHistory);

  // Halt/resume proof of concept: the lambda processor stops the AI SDK loop
  // after every step, so a turn that wants tools comes back with finishReason
  // 'tool-calls'. Each round is finalized exactly like a normal turn (saved,
  // handed to the UI), then the updated history is sent straight back so the
  // model continues from its own recorded tool calls and results.
  let history = fullHistory;

  for (let round = 0; round < MAX_CONTINUATION_ROUNDS; round++) {
    const aiMessages = chatMessagesToAiMessages(history, docStorageDrive, docId);

    if (round > 0) {
      aiMessages.push({ role: 'user', content: CONTINUATION_NUDGE });
    }

    // Tools do NOT receive the docId from the model — executors inherit the
    // session context (provided in eventDocAiServiceRequest) and read the
    // trusted id there.
    const streamHandle = yield* askAiPromptStream(model, message, {
      system: systemPrompt,
      aiName,
      messages: aiMessages,
      reasoning: reasoningBudgetTokens ? { budgetTokens: reasoningBudgetTokens } : undefined,
      caching: true,
    });

    const assistantParts = yield* askStreamMap(streamHandle, function* askMap(part) {
      yield* askUIEventDocAiAppendStreamChunk(part);
      return part;
    });

    // Fold the transport parts into durable segments; a stream that produced no
    // content (e.g. it errored before any text) saves no assistant message.
    const segments = mergeStreamParts(assistantParts);

    if (segments.length > 0) {
      const assistantMessage: EventDocAiChatMessage = {
        role: 'assistant',
        segments,
      };

      // Persist the folded reply, hand the finalized message to the UI, then
      // clear its (now superseded) live-stream buffer.
      history = [...history, assistantMessage];

      yield* askEventDocAiChatHistorySave(docId, chatId, history);

      yield* askUIEventDocAiAppendChatMessage(assistantMessage);
    }

    yield* askUIEventDocAiClearStream();

    const stoppedPrematurely = getFinishReason(assistantParts) === AiStreamFinishReasonEnum.toolCalls;

    // Loop back only when the turn was cut off mid-work AND actually produced
    // something; an empty round can never make progress by being resent.
    if (!stoppedPrematurely || segments.length === 0) {
      break;
    }
  }

  yield* askEventDocAiChatTouch(docId, chatId);

  return { complete: true };
}
