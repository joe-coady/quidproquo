import { type AiStreamPart, AiStreamPartType } from 'quidproquo-core';

import type { EventDocAiMessageSegment } from '../../models';
import type { EventDocAiToolUse } from '../../models/EventDocAiToolUse';

// Fold a raw part stream into the durable segment format: consecutive text /
// reasoning deltas merged into their segments; tool calls grouped and paired
// with their results. Used live (rendering the in-flight stream) and at stream
// end (converting the reply for saving).
//
// A tool call surfaces at ToolInputStart — the moment the model begins writing
// the tool's arguments — not at ToolCall, which only arrives once the (possibly
// large) argument JSON has finished streaming. Until then the tool's `input`
// is the raw accumulated JSON fragment, replaced by the parsed value on
// ToolCall, so the UI shows the call being written instead of a silent wait.
export const mergeStreamParts = (parts: AiStreamPart[]): EventDocAiMessageSegment[] => {
  const segments: EventDocAiMessageSegment[] = [];
  // In-flight tool calls keyed by argument-stream id (=== the ToolCall's toolCallId).
  const toolsByCallId = new Map<string, EventDocAiToolUse>();

  const pushTool = (tool: EventDocAiToolUse) => {
    const last = segments[segments.length - 1];
    if (last && last.type === 'tool-use') {
      last.tools.push(tool);
    } else {
      segments.push({ type: 'tool-use', tools: [tool] });
    }
  };

  for (const part of parts) {
    if (part.type === AiStreamPartType.TextDelta) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'text') {
        last.text += part.text;
      } else {
        segments.push({ type: 'text', text: part.text });
      }
    } else if (part.type === AiStreamPartType.ReasoningDelta) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'reasoning') {
        last.text += part.text;
      } else {
        segments.push({ type: 'reasoning', text: part.text });
      }
    } else if (part.type === AiStreamPartType.ToolInputStart) {
      const tool: EventDocAiToolUse = { toolName: part.toolName, input: '' };
      toolsByCallId.set(part.id, tool);
      pushTool(tool);
    } else if (part.type === AiStreamPartType.ToolInputDelta) {
      const tool = toolsByCallId.get(part.id);
      if (tool && typeof tool.input === 'string') {
        tool.input += part.delta;
      }
    } else if (part.type === AiStreamPartType.ToolCall) {
      const streamed = toolsByCallId.get(part.toolCallId);
      if (streamed) {
        streamed.input = part.input;
      } else {
        // Providers that don't stream tool arguments emit ToolCall directly.
        pushTool({ toolName: part.toolName, input: part.input });
      }
    } else if (part.type === AiStreamPartType.ToolResult) {
      const last = segments[segments.length - 1];
      if (last && last.type === 'tool-use') {
        const tool = last.tools.find((t) => t.toolName === part.toolName && t.output === undefined);
        if (tool) {
          tool.output = part.output;
        }
      }
    } else if (part.type === AiStreamPartType.ToolError) {
      // A thrown executor still resolves the call: fold the error in as the
      // output so the model can react to it, and so the call is not mistaken
      // for a client-side tool awaiting the user (output === undefined).
      const last = segments[segments.length - 1];
      if (last && last.type === 'tool-use') {
        const tool = last.tools.find((t) => t.toolName === part.toolName && t.output === undefined);
        if (tool) {
          // TODO: the type of output here is a bit dubious.
          tool.output = { error: part.message };
        }
      }
    }
  }

  return segments;
};
