import { ConfigGetApplicationInfoActionRequesterTypeMap } from './ConfigGetApplicationInfoActionTypes';
import { ConfigGetGlobalActionRequesterTypeMap } from './ConfigGetGlobalActionTypes';
import { ConfigGetParameterActionRequesterTypeMap } from './ConfigGetParameterActionTypes';
import { ConfigGetParametersActionRequesterTypeMap } from './ConfigGetParametersActionTypes';
import { ConfigGetSecretActionRequesterTypeMap } from './ConfigGetSecretActionTypes';
import { ConfigSetParameterActionRequesterTypeMap } from './ConfigSetParameterActionTypes';

export * from './ConfigActionType';

export * from './ConfigGetApplicationInfoActionRequester';
export * from './ConfigGetApplicationInfoActionTypes';

export * from './ConfigGetParameterActionRequester';
export * from './ConfigGetParameterActionTypes';

export * from './ConfigGetParametersActionRequester';
export * from './ConfigGetParametersActionTypes';

export * from './ConfigGetSecretActionRequester';
export * from './ConfigGetSecretActionTypes';

export * from './ConfigGetGlobalActionRequester';
export * from './ConfigGetGlobalActionTypes';

export * from './ConfigSetParameterActionRequester';
export * from './ConfigSetParameterActionTypes';

export type ConfigActionRequesterTypeMap = ConfigGetApplicationInfoActionRequesterTypeMap &
  ConfigGetGlobalActionRequesterTypeMap<any> &
  ConfigGetParameterActionRequesterTypeMap &
  ConfigGetParametersActionRequesterTypeMap &
  ConfigGetSecretActionRequesterTypeMap &
  ConfigSetParameterActionRequesterTypeMap;
