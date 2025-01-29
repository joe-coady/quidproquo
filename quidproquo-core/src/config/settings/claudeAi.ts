// Import the base configuration interfaces and types
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

// Define an enum for model sizes
export enum ClaudeAIModelSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

// Claude AI specific settings, if there are any shared or advanced settings
export interface QPQConfigAdvancedClaudeAISettings extends QPQConfigAdvancedSettings {
  modelSize?: ClaudeAIModelSize;
}

// The main configuration interface for Claude AI
export interface ClaudeAIQPQConfigSetting extends QPQConfigSetting {
  name: string;

  modelSize: ClaudeAIModelSize;
}

// Function to define Claude AI config with optional advanced settings
export const defineClaudeAI = (name: string, options?: QPQConfigAdvancedClaudeAISettings): ClaudeAIQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.claudeAi,
  uniqueKey: name,

  name,

  modelSize: options?.modelSize || ClaudeAIModelSize.Medium, // Default to 'medium' if not specified
});
