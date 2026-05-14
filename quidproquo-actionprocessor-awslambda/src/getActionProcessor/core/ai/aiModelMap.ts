import { AiModel } from 'quidproquo-core';

export const bedrockModelMap: Record<AiModel, string> = {
  [AiModel.ClaudeHaiku35]: 'apac.anthropic.claude-3-5-haiku-20241022-v1:0',
  [AiModel.ClaudeSonnet35]: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
  [AiModel.ClaudeSonnet4]: 'apac.anthropic.claude-sonnet-4-20250514-v1:0',
  [AiModel.ClaudeOpus4]: 'apac.anthropic.claude-opus-4-20250514-v1:0',
  [AiModel.ClaudeHaiku45]: 'apac.anthropic.claude-haiku-4-5-20251001-v1:0',
  [AiModel.ClaudeSonnet45]: 'apac.anthropic.claude-sonnet-4-5-20250929-v1:0',
  [AiModel.ClaudeOpus45]: 'apac.anthropic.claude-opus-4-5-20251101-v1:0',
  [AiModel.ClaudeSonnet46]: 'apac.anthropic.claude-sonnet-4-6',
  [AiModel.ClaudeOpus46]: 'apac.anthropic.claude-opus-4-6-v1',
};
