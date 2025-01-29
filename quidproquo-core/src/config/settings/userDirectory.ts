import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../qpqCoreUtils';
import { ConfigUrl, CrossModuleOwner } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { CustomAuthRuntime, EmailTemplates } from './emailTemplates';

export type AuthDirectoryDnsRecord = {
  subdomain: string;
  rootDomain: string;
};

export enum AuthDirectoryFederatedProviderType {
  Facebook = 'facebook',
  Google = 'google',
}

export type AuthDirectoryFacebookFederatedProvider = {
  type: AuthDirectoryFederatedProviderType.Facebook;

  clientId: string;
  clientSecret: string;
};

export type AuthDirectoryGoogleFederatedProvider = {
  type: AuthDirectoryFederatedProviderType.Google;

  clientId: string;
  clientSecret: string;
};

export type AnyAuthDirectoryFederatedProvider = AuthDirectoryFacebookFederatedProvider | AuthDirectoryGoogleFederatedProvider;

export type AuthDirectoryOAuth = {
  callbacks?: ConfigUrl[];
  federatedProviders?: AnyAuthDirectoryFederatedProvider[];
};

export interface QPQConfigAdvancedUserDirectorySettings extends QPQConfigAdvancedSettings {
  phoneRequired?: boolean;

  selfSignUpEnabled?: boolean;

  emailTemplates?: EmailTemplates;

  owner?: CrossModuleOwner<'userDirectoryName'>;

  dnsRecord?: AuthDirectoryDnsRecord;

  oAuth?: AuthDirectoryOAuth;

  customAuthRuntime?: CustomAuthRuntime;
}

export interface UserDirectoryQPQConfigSetting extends QPQConfigSetting {
  name: string;

  phoneRequired: boolean;

  selfSignUpEnabled: boolean;

  emailTemplates: EmailTemplates;

  owner?: CrossModuleOwner;

  dnsRecord?: AuthDirectoryDnsRecord;
  oAuth?: AuthDirectoryOAuth;

  customAuthRuntime?: CustomAuthRuntime;
}

export const defineUserDirectory = (name: string, options?: QPQConfigAdvancedUserDirectorySettings): UserDirectoryQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.userDirectory,
  uniqueKey: name,

  name,

  phoneRequired: options?.phoneRequired || false,

  selfSignUpEnabled: options?.selfSignUpEnabled || true,

  emailTemplates: {
    verifyEmail: options?.emailTemplates?.verifyEmail,
    resetPassword: options?.emailTemplates?.resetPassword,
    resetPasswordAdmin: options?.emailTemplates?.resetPasswordAdmin,
  },

  dnsRecord: options?.dnsRecord,
  oAuth: options?.oAuth,
  customAuthRuntime: options?.customAuthRuntime,

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
