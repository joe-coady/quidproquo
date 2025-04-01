import { BottomNavigation, BottomNavigationAction, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';

import { useUrlFields } from '../../queryParams';
import { useTabs } from './hooks';

export function MainLayout() {
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
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          pb: '56px', // <— prevent content from being hidden behind bottom nav
        }}
      >
        {tabs
          .filter((t, index) => index === tab)
          .map((tab) => (
            <tab.View key={tab.name} />
          ))}
      </Box>

      <BottomNavigation
        value={tab}
        onChange={(event, newValue) => handleTabOnChange(event, newValue)}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {tabs.map((t) => (
          <BottomNavigationAction key={t.name} label={t.name} icon={t.icon} />
        ))}
        {loading && <BottomNavigationAction label="Loading" icon={<CircularProgress size={18} />} disabled />}
      </BottomNavigation>
    </Box>
  );
}
