import { AiStreamFinish, AiStreamPartType } from 'quidproquo-core';

import { AiSdkStreamPartOfType } from '../types';
import { toAiStreamUsage } from './toAiStreamUsage';

export const mapAiStreamFinish = (part: AiSdkStreamPartOfType<'finish'>): AiStreamFinish => ({
  type: AiStreamPartType.Finish,
  finishReason: part.finishReason,
  usage: toAiStreamUsage(part.totalUsage),
});
