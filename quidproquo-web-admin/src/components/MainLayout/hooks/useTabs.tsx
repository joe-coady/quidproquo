import BugReportIcon from '@mui/icons-material/BugReport';
import ExtensionIcon from '@mui/icons-material/Extension';
import RestoreIcon from '@mui/icons-material/Restore';
// import SettingsIcon from '@mui/icons-material/Settings';
import TerminalIcon from '@mui/icons-material/Terminal';

// import { Config } from '../../../Config';
import { FederatedTab } from '../../../FederatedAddon';
import { AdminLogs } from '../../../LogViewer/AdminLogs';
import { Dashboard } from '../../../LogViewer/Dashboard';
import { LogSearch } from '../../../LogViewer/LogSearch';
import { useFederatedAddon } from '../../../useFederatedAddon';

export function useTabs(): {
  tabs: FederatedTab[];
  loading: boolean;
} {
  const { addons, loading } = useFederatedAddon();

  const allTabs: FederatedTab[] = [
    {
      name: 'Events',
      View: LogSearch,
      icon: <RestoreIcon />,
    },
    {
      name: 'Logs',
      View: AdminLogs,
      icon: <TerminalIcon />,
    },
    {
      name: 'Errors',
      View: Dashboard,
      icon: <BugReportIcon />,
    },
    // {
    //   name: 'Advanced',
    //   View: Config,
    //   icon: <SettingsIcon />,
    // },
    ...addons.map((addon) => ({
      ...addon.tab,
      icon: <ExtensionIcon />,
    })),
  ];

  return {
    tabs: allTabs,
    loading,
  };
}
