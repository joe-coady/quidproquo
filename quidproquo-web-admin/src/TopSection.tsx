import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import InputLabel from '@mui/material/InputLabel';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

// Object.keys(QpqRuntimeType)
export const RuntimeTypes = [
  'ALL',
  'API',
  'EXECUTE_STORY',
  'EVENT_BRIDGE_EVENT',
  'QUEUE_EVENT',
  'EVENT_SEO_OR',
  'SERVICE_FUNCTION_EXE',
];

export interface SearchParams {
  runtimeType: string;
  errorFilter: string;
  startIsoDateTime: string;
  endIsoDateTime: string;
}

export interface TopSectionProps {
  searchParams: SearchParams;
  setSearchParams: (setter: (searchParams: SearchParams) => SearchParams) => void;

  onSearch: () => void;
}

export function TopSection(props: TopSectionProps) {
  const { searchParams, setSearchParams } = props;

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
      <Grid container columns={12} spacing={2} style={{ width: '100%' }}>
        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel id="runtime-select-label">Runtime Type</InputLabel>
            <Select
              labelId="runtime-select-label"
              id="demo-simple-select"
              value={props.searchParams.runtimeType}
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
          <DateTimePicker
            label="Start DateTime"
            value={new Date(props.searchParams.startIsoDateTime)}
            onChange={handleStartDateChange}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={2}>
          <DateTimePicker
            label="End DateTime"
            value={new Date(props.searchParams.endIsoDateTime)}
            onChange={handleEndDateChange}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            label="Error Filter"
            value={props.searchParams.errorFilter}
            onChange={handleErrorFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={1}>
          <Button
            variant="contained"
            onClick={() => props.onSearch()}
            style={{ width: '100%', height: '100%' }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
