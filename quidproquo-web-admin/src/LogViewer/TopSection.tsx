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

export interface TopSectionProps {
  searchParams: SearchParams;
  setSearchParams: (setter: (searchParams: SearchParams) => SearchParams) => void;

  onSearch: () => Promise<any>;
}

export function TopSection({ searchParams, setSearchParams, onSearch }: TopSectionProps) {
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
            <DateTimePicker
              label="Start DateTime"
              value={new Date(searchParams.startIsoDateTime)}
              onChange={handleStartDateChange}
            />
          </FormControl>
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
          <AsyncButton
            onClick={() => onSearch()}
            style={{ width: '100%', height: '100%' }}
          >
            Search
          </AsyncButton>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
