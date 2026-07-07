import { describe, expect, it } from 'vitest';

import { QPQCoreConfigSettingType } from '../QPQConfig';
import { ClaudeAIModelSize, defineClaudeAI } from './claudeAi';

describe('defineClaudeAI', () => {
  it('builds a ClaudeAi setting with the given name and defaults the model size to medium', () => {
    expect(defineClaudeAI('Claude')).toEqual({
      configSettingType: QPQCoreConfigSettingType.claudeAi,
      uniqueKey: 'Claude',
      name: 'Claude',
      modelSize: ClaudeAIModelSize.Medium,
    });
  });

  it('uses the supplied model size', () => {
    expect(defineClaudeAI('Claude', { modelSize: ClaudeAIModelSize.Large }).modelSize).toBe(ClaudeAIModelSize.Large);
  });
});
