import React, { useState } from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, TextField, Toolbar, Typography } from '@mui/material';

import { useServiceNames } from '../LogViewer/hooks';

const drawerWidth = 240;

const sections = ['General', 'Settings', 'Advanced'];

export function Config() {
  const [selectedServiceOverride, setSelectedServiceOverride] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const services = useServiceNames();

  const handleServiceClick = (service: string) => {
    setSelectedServiceOverride(service);
    setTabIndex(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const filteredServices = services.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()));
  const selectedService = selectedServiceOverride || services[0]?.label;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search services"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(filteredServices[0]?.label);
                handleServiceClick(filteredServices[0]?.label);
              }
            }}
            sx={{ mt: 2 }}
          />
        </Toolbar>
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <List>
            {filteredServices.map((service) => (
              <ListItem key={service.value} disablePadding>
                <ListItemButton selected={service.label === selectedService} onClick={() => handleServiceClick(service.label)}>
                  <ListItemText primary={service.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {selectedService} Service
        </Typography>

        {/* Tabs */}
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {sections.map((section, index) => (
            <Tab key={index} label={section} />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ mt: 2 }}>
          {sections[tabIndex] === 'General' && <Typography>General settings for {selectedService}</Typography>}
          {sections[tabIndex] === 'Settings' && <Typography>Custom configuration options</Typography>}
          {sections[tabIndex] === 'Advanced' && <Typography>Advanced tuning and overrides</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

export default Config;
