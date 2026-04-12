import { AiModel } from 'quidproquo-core';

export const bedrockModelMap: Record<AiModel, string> = {
  [AiModel.ClaudeHaiku35]: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
  [AiModel.ClaudeSonnet35]: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  [AiModel.ClaudeSonnet4]: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
  [AiModel.ClaudeOpus4]: 'us.anthropic.claude-opus-4-20250514-v1:0',
  [AiModel.ClaudeHaiku45]: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  [AiModel.ClaudeSonnet45]: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
  [AiModel.ClaudeOpus45]: 'us.anthropic.claude-opus-4-5-20251101-v1:0',
  [AiModel.ClaudeSonnet46]: 'us.anthropic.claude-sonnet-4-6',
  [AiModel.ClaudeOpus46]: 'us.anthropic.claude-opus-4-6-v1',
};
