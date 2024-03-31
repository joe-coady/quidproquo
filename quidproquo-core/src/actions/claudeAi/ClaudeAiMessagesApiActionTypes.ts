import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ClaudeAiActionType } from './ClaudeAiActionType';
import Anthropic from '@anthropic-ai/sdk';

// Payload
export interface ClaudeAiMessagesApiActionPayload {
  body: Anthropic.Messages.MessageCreateParamsNonStreaming;
  apiKey: string;
}

// Action
export interface ClaudeAiMessagesApiAction extends Action<ClaudeAiMessagesApiActionPayload> {
  type: ClaudeAiActionType.MessagesApi;
  payload: ClaudeAiMessagesApiActionPayload;
}

// Function Types
export type ClaudeAiMessagesApiActionProcessor = ActionProcessor<
  ClaudeAiMessagesApiAction,
  Anthropic.Message
>;
export type ClaudeAiMessagesApiActionRequester = ActionRequester<
  ClaudeAiMessagesApiAction,
  Anthropic.Message
>;
