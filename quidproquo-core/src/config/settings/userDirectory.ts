import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

import { EmailTemplates } from './emailTemplates/types';
import { verifyEmailTemplate } from './emailTemplates';

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;

  selfSignUpEnabled?: boolean;

  emailTemplates?: EmailTemplates;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;
  buildPath: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;

  emailTemplates: EmailTemplates;
}

export const defineUserDirectory = (
  name: string,
  buildPath: string,
  options?: QPQConfigAdvancedUserDirectorySettings,
): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,
  buildPath,

  phoneRequired: options?.phoneRequired || false,

  selfSignUpEnabled: options?.selfSignUpEnabled || true,

  emailTemplates: {
    verifyEmail: options?.emailTemplates?.verifyEmail || verifyEmailTemplate,
  },
});
