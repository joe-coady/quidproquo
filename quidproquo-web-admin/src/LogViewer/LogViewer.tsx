import React from 'react';
import { Tabs, Tab } from '@mui/material';
import Box from '@mui/material/Box';
import { LogSearch } from './LogSearch';
import { Dashboard } from './Dashboard';
import { useFederatedAddon } from '../useFederatedAddon';
import { FederatedTab } from '../FederatedAddon';

export function useTabs(): FederatedTab[] {
  const addons = useFederatedAddon('shop_fm');

  const allTabs: FederatedTab[] = [
    {
      name: 'Logs',
      View: LogSearch,
    },
    {
      name: 'Errors',
      View: Dashboard,
    },
    ...addons.map((addon) => addon.tab),
  ];

  return allTabs;
}

export function LogViewer() {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const allTabs = useTabs();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {allTabs
          .filter((tab, index) => index === selectedTab)
          .map((tab, index) => (
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
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          {allTabs.map((tab, index) => (
            <Tab key={tab.name} label={tab.name} />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
