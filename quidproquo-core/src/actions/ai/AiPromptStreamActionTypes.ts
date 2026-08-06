import { StreamHandle } from '../../types/StreamRegistry';
import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiReasoningConfig } from './AiReasoningConfig';
import { AiStreamPart } from './types';

export type { AiStreamPart };

export interface AiPromptStreamActionPayload {
  model: AiModel;
  prompt: string;
  messages?: AiMessage[];
  system?: string;
  aiName?: string;
  reasoning?: AiReasoningConfig;
  caching?: boolean;
}
