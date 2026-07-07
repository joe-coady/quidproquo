import { authContext, QpqContextProvider, QpqRuntimeEffectCatcher, useQpqRuntime } from 'quidproquo-web-react';

import { ReactNode, useContext } from 'react';

import { getApplySessionEventActionProcessor } from '../../actions/getApplySessionEventActionProcessor';
import { adminAppRuntime } from '../../adminAppRuntime';
import { AdminUserContext, adminUserContext } from '../../contexts/adminUserContext';
import { askAdminAppMain } from '../../logic/askAdminAppMain';

type AdminAppProviderProps = {
  children?: ReactNode;
};

// Mounts only once authenticated (inside Auth), so mounting IS session start:
// the boot story creates the session doc, seeds it from the URL, and runs the
// flush loop for the life of the page.
const AdminAppRuntimeMount: React.FC<AdminAppProviderProps> = ({ children }) => {
  useQpqRuntime(adminAppRuntime, askAdminAppMain, undefined, getApplySessionEventActionProcessor);

  return <QpqRuntimeEffectCatcher runtime={adminAppRuntime}>{children}</QpqRuntimeEffectCatcher>;
};

export const AdminAppProvider: React.FC<AdminAppProviderProps> = ({ children }) => {
  const authState = useContext(authContext);

  const adminUser: AdminUserContext = {
    username: authState?.username ?? '',
  };

  return (
    <QpqContextProvider contextIdentifier={adminUserContext} value={adminUser}>
      <AdminAppRuntimeMount>{children}</AdminAppRuntimeMount>
    </QpqContextProvider>
  );
};
