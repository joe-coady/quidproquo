import { AiStreamFinishReasonEnum } from 'quidproquo-core';

const knownFinishReasons = new Set<string>(Object.values(AiStreamFinishReasonEnum));

// The AI SDK's FinishReason strings map 1:1 onto the enum today; anything a future SDK version
// adds degrades to `unknown` instead of leaking an untyped string into core's typed parts.
export const toAiStreamFinishReason = (finishReason: string): AiStreamFinishReasonEnum =>
  knownFinishReasons.has(finishReason) ? (finishReason as AiStreamFinishReasonEnum) : AiStreamFinishReasonEnum.unknown;
