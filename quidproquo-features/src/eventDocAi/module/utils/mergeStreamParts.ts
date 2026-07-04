import { type AiStreamPart, AiStreamPartType } from 'quidproquo-core';

import type { EventDocAiMessageSegment } from '../../models';

// Fold a raw part stream into the durable segment format: consecutive text
// deltas merged into one text segment; tool calls grouped and paired with
// their results. Used live (rendering the in-flight stream) and at stream end
// (converting the reply for saving).
export const mergeStreamParts = (parts: AiStreamPart[]): EventDocAiMessageSegment[] => {
  const segments: EventDocAiMessageSegment[] = [];

  for (const part of parts) {
    if (part.type === AiStreamPartType.TextDelta) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'text') {
        last.text += part.text;
      } else {
        segments.push({ type: 'text', text: part.text });
      }
    } else if (part.type === AiStreamPartType.ToolCall) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'tool-use') {
        last.tools.push({ toolName: part.toolName, input: part.input });
      } else {
        segments.push({
          type: 'tool-use',
          tools: [{ toolName: part.toolName, input: part.input }],
        });
      }
    } else if (part.type === AiStreamPartType.ToolResult) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'tool-use') {
        const tool = last.tools.find((t) => t.toolName === part.toolName && t.output === undefined);
        if (tool) {
          tool.output = part.output;
        }
      }
    }
  }

  return segments;
};
