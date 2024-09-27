import React, { useState } from 'react';
import { Box, FormControl, IconButton, Menu, MenuItem, Grid } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface DateRangePickerProps {
  startIsoDateTime: string;
  endIsoDateTime: string;
  setStartIsoDateTime: (isoString: string) => void;
  setEndIsoDateTime: (isoString: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startIsoDateTime, endIsoDateTime, setStartIsoDateTime, setEndIsoDateTime }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleStartDateChange = (value: Date | null) => {
    if (value) {
      setStartIsoDateTime(value.toISOString());
    }
  };

  const handleEndDateChange = (value: Date | null) => {
    if (value) {
      setEndIsoDateTime(value.toISOString());
    }
  };

  const handleQuickTimeSelect = (minutes: number) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - minutes * 60000);
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60000);

    setStartIsoDateTime(startDate.toISOString());
    setEndIsoDateTime(endDate.toISOString());

    setAnchorEl(null);
  };

  const handleQuickTimeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleQuickTimeClose = () => {
    setAnchorEl(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box position="relative">
            <FormControl fullWidth>
              <DateTimePicker label="Start DateTime" value={new Date(startIsoDateTime)} onChange={handleStartDateChange} />
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box position="relative">
            <FormControl fullWidth>
              <DateTimePicker label="End DateTime" value={new Date(endIsoDateTime)} onChange={handleEndDateChange} />
            </FormControl>
            <IconButton
              aria-label="quick time select"
              aria-controls="quick-time-menu"
              aria-haspopup="true"
              onClick={handleQuickTimeClick}
              sx={{
                position: 'absolute',
                right: '-28px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Menu id="quick-time-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleQuickTimeClose}>
        <MenuItem onClick={() => handleQuickTimeSelect(5)}>Last 5 minutes</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(30)}>Last 30 minutes</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(1 * 60)}>Last hour</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(3 * 60)}>Last 3 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(8 * 60)}>Last 8 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(16 * 60)}>Last 16 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(24 * 60)}>Last 24 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(7 * 24 * 60)}>Last 7 days</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(30 * 24 * 60)}>Last month</MenuItem>
      </Menu>
    </LocalizationProvider>
  );
};
