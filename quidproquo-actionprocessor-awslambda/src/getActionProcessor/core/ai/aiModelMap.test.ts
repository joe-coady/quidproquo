import { AiModel } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { bedrockModelMap } from './aiModelMap';

describe('bedrockModelMap', () => {
  it.each(Object.values(AiModel))('maps %s to a non-empty bedrock model id', (model: AiModel) => {
    expect(typeof bedrockModelMap[model]).toBe('string');
    expect(bedrockModelMap[model].length).toBeGreaterThan(0);
  });

  it('covers every AiModel enum member', () => {
    expect(Object.keys(bedrockModelMap).sort()).toEqual(Object.values(AiModel).sort());
  });

  it('maps ClaudeHaiku35 to its anthropic bedrock id', () => {
    expect(bedrockModelMap[AiModel.ClaudeHaiku35]).toBe('au.anthropic.claude-3-5-haiku-20241022-v1:0');
  });
});
