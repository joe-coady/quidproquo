import { createHmac } from 'crypto';

import { memoFunc } from '../../cache/memoFunc';

export const calculateSecretHash = memoFunc((username: string, clientId: string, clientSecret: string) => {
  // create the hmac with the sha256 algorithm and a secret key
  const hasher = createHmac('sha256', clientSecret);

  // add the value we want to hash
  hasher.update(`${username}${clientId}`);

  // get the hashed value as base64
  return hasher.digest('base64');
});
