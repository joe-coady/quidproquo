import { AiModel } from 'quidproquo-core';

export const bedrockModelMap: Record<AiModel, string> = {
  [AiModel.ClaudeHaiku35]: 'au.anthropic.claude-3-5-haiku-20241022-v1:0',
  [AiModel.ClaudeSonnet35]: 'au.anthropic.claude-3-5-sonnet-20241022-v2:0',
  [AiModel.ClaudeSonnet4]: 'au.anthropic.claude-sonnet-4-20250514-v1:0',
  [AiModel.ClaudeOpus4]: 'au.anthropic.claude-opus-4-20250514-v1:0',
  [AiModel.ClaudeHaiku45]: 'au.anthropic.claude-haiku-4-5-20251001-v1:0',
  [AiModel.ClaudeSonnet45]: 'au.anthropic.claude-sonnet-4-5-20250929-v1:0',
  [AiModel.ClaudeOpus45]: 'au.anthropic.claude-opus-4-5-20251101-v1:0',
  [AiModel.ClaudeSonnet46]: 'au.anthropic.claude-sonnet-4-6',
  [AiModel.ClaudeOpus46]: 'au.anthropic.claude-opus-4-6-v1',
};
