import { defineServiceSettings, QPQConfig } from 'quidproquo-core';

import { defineEventDoc } from '../../eventDoc';
import { adminSessionBasePath, adminSessionDocType, adminSessionStoreName } from '../constants/adminSessionConstants';
import { adminUserDirectoryResourceName } from './adminUserDirectory';

// Admin UI sessions: one event doc per login, every user-intent event appended
// for audit. Scoped to the log service like the other admin-only resources.
export const defineAdminSessionEventDoc = (logServiceName: string): QPQConfig => [
  defineServiceSettings({
    [logServiceName]: defineEventDoc({
      storeName: adminSessionStoreName,
      type: adminSessionDocType,
      basePath: adminSessionBasePath,
      routeAuthSettings: {
        userDirectoryName: adminUserDirectoryResourceName,
      },
    }),
  }),
];
