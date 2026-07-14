import { AiStreamFinish, AiStreamPartType } from 'quidproquo-core';

import { AiSdkStreamPartOfType } from '../types';
import { toAiStreamFinishReason } from './toAiStreamFinishReason';
import { toAiStreamUsage } from './toAiStreamUsage';

export const mapAiStreamFinish = (part: AiSdkStreamPartOfType<'finish'>): AiStreamFinish => ({
  type: AiStreamPartType.Finish,
  finishReason: toAiStreamFinishReason(part.finishReason),
  usage: toAiStreamUsage(part.totalUsage),
});
