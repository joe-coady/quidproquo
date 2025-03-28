import React from 'react';
import { CircularProgress, Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';

import { FederatedTab } from '../FederatedAddon';
import { useUrlFields } from '../queryParams';
import { useFederatedAddon } from '../useFederatedAddon';
import { AdminLogs } from './AdminLogs';
import { Dashboard } from './Dashboard';
import { LogSearch } from './LogSearch';

export function useTabs(): {
  tabs: FederatedTab[];
  loading: boolean;
} {
  const { addons, loading } = useFederatedAddon();

  const allTabs: FederatedTab[] = [
    // {
    //   name: 'TEST',
    //   View: RandomView,
    // },
    {
      name: 'Events',
      View: LogSearch,
    },
    {
      name: 'Logs',
      View: AdminLogs,
    },
    {
      name: 'Errors',
      View: Dashboard,
    },
    ...addons.map((addon) => addon.tab),
  ];

  return {
    tabs: allTabs,
    loading,
  };
}

export function LogViewer() {
  const { tabs, loading } = useTabs();

  const { tab, handleTabOnChange } = useUrlFields();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {tabs
          .filter((t, index) => index === tab)
          .map((tab) => (
            <tab.View key={tab.name} />
          ))}
      </Box>
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Tabs value={tab} onChange={handleTabOnChange} centered>
          {tabs.map((tab, index) => (
            <Tab key={tab.name} label={tab.name} />
          ))}
          {loading && <Tab label={<CircularProgress size={16} />} />}
        </Tabs>
      </Box>
    </Box>
  );
}
