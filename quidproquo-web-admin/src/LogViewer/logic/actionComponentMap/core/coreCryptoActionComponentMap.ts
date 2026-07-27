import { CryptoActionType } from 'quidproquo-core';

const coreCryptoActionComponentMap: Record<string, string[]> = {
  [CryptoActionType.Encrypt]: ['askCryptoEncrypt', 'keyName', 'context'],
  [CryptoActionType.Decrypt]: ['askCryptoDecrypt', 'keyName', 'context'],
};

export default coreCryptoActionComponentMap;
