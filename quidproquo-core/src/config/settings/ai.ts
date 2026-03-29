import { CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../utils/crossModuleUtils';

export interface AiToolDefinition {
  name: string;
  description: string;
  executor: string;
  inputSchema: Record<string, unknown>;
}

export interface QPQConfigAdvancedAiSettings extends QPQConfigAdvancedSettings {
  tools?: AiToolDefinition[];
  owner?: CrossModuleOwner<'aiName'>;
}

export interface AiQPQConfigSetting extends QPQConfigSetting {
  aiName: string;
  tools: AiToolDefinition[];
}

export const defineAi = (
  aiName: string,
  options: QPQConfigAdvancedAiSettings,
): AiQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.ai,
  uniqueKey: aiName,

  aiName,

  tools: options.tools || [],

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
