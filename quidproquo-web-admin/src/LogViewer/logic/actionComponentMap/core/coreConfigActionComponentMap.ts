const coreConfigActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/Config/GetApplicationInfo']: ['askConfigGetApplicationInfo'],
  ['@quidproquo-core/Config/GetGlobal']: ['askConfigGetGlobal', 'globalName'],
  ['@quidproquo-core/Config/GetParameter']: ['askConfigGetParameter', 'parameterName'],
  ['@quidproquo-core/Config/GetParameters']: ['askConfigGetParameters', 'parameterNames'],
  ['@quidproquo-core/Config/GetSecret']: ['askConfigGetSecret', 'secretName'],
  ['@quidproquo-core/Config/SetParameter']: [
    'askConfigSetParameter',
    'parameterName',
    'parameterValue',
  ],
};

export default coreConfigActionComponentMap;
