import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import Grid from '@mui/material/Grid';

import InputLabel from '@mui/material/InputLabel';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

import { SearchParams } from './types';
import { RuntimeTypes } from './constants';
import { AsyncButton } from '../components';
import { IconButton, Menu } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { Box } from '@mui/system';

export interface TopSectionProps {
  searchParams: SearchParams;
  setSearchParams: (setter: (searchParams: SearchParams) => SearchParams) => void;

  onSearch: () => Promise<any>;
}

export function TopSection({ searchParams, setSearchParams, onSearch }: TopSectionProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleRuntimeTypeChange = (event: SelectChangeEvent<string>) => {
    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      runtimeType: event.target.value,
    }));
  };

  const handleStartDateChange = (value: Date | null) => {
    if (value) {
      setSearchParams((prevSearchParams) => ({
        ...prevSearchParams,
        startIsoDateTime: value.toISOString(),
      }));
    }
  };

  const handleEndDateChange = (value: Date | null) => {
    if (value) {
      setSearchParams((prevSearchParams) => ({
        ...prevSearchParams,
        endIsoDateTime: value.toISOString(),
      }));
    }
  };

  const handleErrorFilterChange = (event: any) => {
    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      errorFilter: event.target.value,
    }));
  };

  const handleQuickTimeSelect = (minutes: number) => {
    const now = new Date();
    // Calculate the start date by subtracting minutes from the current time
    const startDate = new Date(now.getTime() - minutes * 60000);
    // Set the end date to 24 hours from the current time
    const endDate = new Date(now.getTime() + 24 * 60 * 60000);

    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      startIsoDateTime: startDate.toISOString(),
      // Use the newly calculated endDate for the endIsoDateTime
      endIsoDateTime: endDate.toISOString(),
    }));

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
      <Grid container columns={12} spacing={2}>
        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel id="runtime-select-label">Runtime Type</InputLabel>
            <Select
              labelId="runtime-select-label"
              id="demo-simple-select"
              value={searchParams.runtimeType}
              label="Runtime Type"
              onChange={handleRuntimeTypeChange}
            >
              {RuntimeTypes.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <Box position="relative">
            <FormControl fullWidth>
              <DateTimePicker
                label="Start DateTime"
                value={new Date(searchParams.startIsoDateTime)}
                onChange={handleStartDateChange}
              />
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
        <Grid item xs={2}>
          <FormControl fullWidth>
            <DateTimePicker
              label="End DateTime"
              value={new Date(searchParams.endIsoDateTime)}
              onChange={handleEndDateChange}
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <TextField
              label="Error Filter"
              value={searchParams.errorFilter}
              onChange={handleErrorFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={1}>
          <AsyncButton onClick={() => onSearch()} style={{ width: '100%', height: '100%' }}>
            Search
          </AsyncButton>
        </Grid>
      </Grid>
      <Menu
        id="quick-time-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleQuickTimeClose}
      >
        <MenuItem onClick={() => handleQuickTimeSelect(5)}>Last 5 minutes</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(3 * 60)}>Last 3 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(8 * 60)}>Last 8 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(16 * 60)}>Last 16 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(24 * 60)}>Last 24 hours</MenuItem>
        <MenuItem onClick={() => handleQuickTimeSelect(7 * 24 * 60)}>Last 7 days</MenuItem>
      </Menu>
    </LocalizationProvider>
  );
}
