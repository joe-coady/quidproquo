import { AiStreamAbort } from './AiStreamAbort';
import { AiStreamError } from './AiStreamError';
import { AiStreamFilePart } from './AiStreamFilePart';
import { AiStreamFinish } from './AiStreamFinish';
import { AiStreamFinishStep } from './AiStreamFinishStep';
import { AiStreamRaw } from './AiStreamRaw';
import { AiStreamReasoningDelta } from './AiStreamReasoningDelta';
import { AiStreamReasoningEnd } from './AiStreamReasoningEnd';
import { AiStreamReasoningStart } from './AiStreamReasoningStart';
import { AiStreamSourcePart } from './AiStreamSourcePart';
import { AiStreamStart } from './AiStreamStart';
import { AiStreamStartStep } from './AiStreamStartStep';
import { AiStreamTextDelta } from './AiStreamTextDelta';
import { AiStreamTextEnd } from './AiStreamTextEnd';
import { AiStreamTextStart } from './AiStreamTextStart';
import { AiStreamToolApprovalRequest } from './AiStreamToolApprovalRequest';
import { AiStreamToolCall } from './AiStreamToolCall';
import { AiStreamToolError } from './AiStreamToolError';
import { AiStreamToolInputDelta } from './AiStreamToolInputDelta';
import { AiStreamToolInputEnd } from './AiStreamToolInputEnd';
import { AiStreamToolInputStart } from './AiStreamToolInputStart';
import { AiStreamToolOutputDenied } from './AiStreamToolOutputDenied';
import { AiStreamToolResult } from './AiStreamToolResult';

/**
 * Discriminated union of every event that can be emitted from an AI prompt stream.
 *
 * Narrow on `type` (an {@link AiStreamPartType} value) to access the per-variant fields.
 */
export type AiStreamPart =
  | AiStreamStart
  | AiStreamFinish
  | AiStreamStartStep
  | AiStreamFinishStep
  | AiStreamAbort
  | AiStreamError
  | AiStreamRaw
  | AiStreamSourcePart
  | AiStreamFilePart
  | AiStreamTextStart
  | AiStreamTextEnd
  | AiStreamTextDelta
  | AiStreamReasoningStart
  | AiStreamReasoningEnd
  | AiStreamReasoningDelta
  | AiStreamToolInputStart
  | AiStreamToolInputEnd
  | AiStreamToolInputDelta
  | AiStreamToolCall
  | AiStreamToolResult
  | AiStreamToolError
  | AiStreamToolOutputDenied
  | AiStreamToolApprovalRequest;
