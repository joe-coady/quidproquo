import { logLevelEnumLookups } from 'quidproquo-core';

import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Autocomplete, IconButton, Menu } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/system';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { AsyncButton } from '../../../components';
import { useUrlFields } from '../../../queryParams';
import { useServiceNames } from '../../hooks';

export interface AdminLogSearchBarProps {
  onSearch: () => Promise<any>;
}

export function AdminLogSearchBar({ onSearch }: AdminLogSearchBarProps) {
  const serviceOptions = useServiceNames();

  const {
    service,
    handleServiceOnChange,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    msg,
    handleMsgOnChange,
    updateStartAndEndTimeSpan,
    logLevel,
    handleLogLevelOnChange,
  } = useUrlFields();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleQuickTimeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleQuickTimeClose = () => {
    setAnchorEl(null);
  };

  const handleQuickTimeSelect = (minutes: number) => {
    updateStartAndEndTimeSpan(minutes);
    handleQuickTimeClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container columns={12} spacing={2}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel id="runtime-select-label">Log Level</InputLabel>
            <Select labelId="runtime-select-label" id="demo-simple-select" value={logLevel} label="Log Level" onChange={handleLogLevelOnChange}>
              {logLevelEnumLookups.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Autocomplete
              getOptionLabel={(option) => option.label}
              options={serviceOptions}
              value={serviceOptions.find((o) => o.value === service) || null}
              onChange={handleServiceOnChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Service Name"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Box position="relative">
            <FormControl fullWidth>
              <DateTimePicker label="Start DateTime" value={startDate} onChange={handleStartDateChange} />
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
        <Grid item xs={3}>
          <FormControl fullWidth>
            <DateTimePicker label="End DateTime" value={endDate} onChange={handleEndDateChange} />
          </FormControl>
        </Grid>
        <Grid item xs={10}>
          <FormControl fullWidth>
            <TextField
              label="Message"
              value={msg}
              onChange={handleMsgOnChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <AsyncButton onClick={() => onSearch()}>Search</AsyncButton>
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
}
