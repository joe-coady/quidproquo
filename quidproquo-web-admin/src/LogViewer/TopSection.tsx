// import { askSyncParams, sharedQueryParamsRuntime, useQpqRuntime } from 'quidproquo-web-react';

import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Autocomplete, IconButton, Menu } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/system';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { AsyncButton } from '../components';
import { RuntimeTypes } from './constants';
import { useServiceNames } from './hooks';
import { SearchParams } from './types';

export interface TopSectionProps {
  searchParams: SearchParams;
  setSearchParams: (setter: (searchParams: SearchParams) => SearchParams) => void;
  onSearch: () => Promise<any>;
}

export function TopSection({ searchParams, setSearchParams, onSearch }: TopSectionProps) {
  // const [api, state] = useQpqRuntime(sharedQueryParamsRuntime, askSyncParams);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const serviceOptions = useServiceNames();

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

  const handleUserFilterChange = (event: any) => {
    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      userFilter: event.target.value,
    }));
  };

  const handleInfoFilterChange = (event: any) => {
    setSearchParams((prev) => ({ ...prev, infoFilter: event.target.value }));
  };

  const handleDeepSearchChange = (event: any) => {
    setSearchParams((prev) => ({ ...prev, deep: event.target.value }));
  };

  const handleQuickTimeSelect = (minutes: number) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - minutes * 60000);
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60000);

    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      startIsoDateTime: startDate.toISOString(),
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

  const handleServiceChange = (event: any, value: any) => {
    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      serviceFilter: value ? value.value : '',
    }));
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
          <FormControl fullWidth>
            <Autocomplete
              options={serviceOptions}
              getOptionLabel={(option) => option.label}
              onChange={handleServiceChange}
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
        <Grid item xs={2}>
          <Box position="relative">
            <FormControl fullWidth>
              <DateTimePicker label="Start DateTime" value={new Date(searchParams.startIsoDateTime)} onChange={handleStartDateChange} />
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
            <DateTimePicker label="End DateTime" value={new Date(searchParams.endIsoDateTime)} onChange={handleEndDateChange} />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <TextField
              label="User"
              value={searchParams.userFilter}
              onChange={handleUserFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <TextField
              label="Info"
              value={searchParams.infoFilter}
              onChange={handleInfoFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
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
        <Grid item xs={10}>
          <FormControl fullWidth>
            <TextField
              label="Deep Search"
              value={searchParams.deep}
              onChange={handleDeepSearchChange}
              placeholder="Use with caution, reduce results with above fields first, this is a contains search on the log JSON, so it will be slow."
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
