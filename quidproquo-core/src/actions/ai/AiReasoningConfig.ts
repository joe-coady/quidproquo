/**
 * Enables extended thinking for a prompt. Presence turns reasoning on; the
 * budget caps how many tokens the model may spend thinking before it answers.
 * Reasoning progress is surfaced as Reasoning* stream parts.
 */
export interface AiReasoningConfig {
  budgetTokens?: number;
}
