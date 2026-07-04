import type { EventDocAiMessageSegment } from '../../models';

const formatToolValue = (value: unknown): string => (typeof value === 'string' ? value : JSON.stringify(value));

// Flatten a message's segments to a single text block for the LLM's message
// history (tool calls/results rendered inline as text).
export const segmentsToText = (segments: EventDocAiMessageSegment[]): string =>
  segments
    .map((segment) => {
      if (segment.type === 'text') {
        return segment.text;
      }

      if (segment.type === 'file') {
        return `[attached file: ${segment.attachment.filename}]`;
      }

      return segment.tools
        .map((tool) => `tool call ${tool.toolName}: ${formatToolValue(tool.input)}\nresponded: ${formatToolValue(tool.output)}`)
        .join('\n');
    })
    .join('\n');
