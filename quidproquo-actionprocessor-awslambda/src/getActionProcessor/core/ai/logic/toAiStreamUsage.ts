import { AiStreamUsage } from 'quidproquo-core';

export const toAiStreamUsage = (usage: {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): AiStreamUsage => ({
  inputTokens: usage.inputTokens,
  outputTokens: usage.outputTokens,
  totalTokens: usage.totalTokens,
});
