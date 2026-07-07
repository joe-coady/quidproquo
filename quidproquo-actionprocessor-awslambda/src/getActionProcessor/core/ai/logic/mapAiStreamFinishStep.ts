import { AiStreamFinishStep, AiStreamPartType } from 'quidproquo-core';

import { AiSdkStreamPartOfType } from '../types';
import { toAiStreamUsage } from './toAiStreamUsage';

export const mapAiStreamFinishStep = (part: AiSdkStreamPartOfType<'finish-step'>): AiStreamFinishStep => ({
  type: AiStreamPartType.FinishStep,
  finishReason: part.finishReason,
  usage: toAiStreamUsage(part.usage),
});
