import React from 'react';
import { Tabs, Tab } from '@mui/material';
import Box from '@mui/material/Box';
import { LogSearch } from './LogSearch';
import { Dashboard } from './Dashboard';

export function LogViewer() {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {selectedTab === 0 && <LogSearch />}
        {selectedTab === 1 && <Dashboard />}
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
          <Tab label="Logs" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>
    </Box>
  );
}
