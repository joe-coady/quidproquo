import { useState } from 'react';

import { DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LogDetails } from './LogDetails';
import { apiRequestPost } from '../logic';
import { LogCorrelations } from './LogCorrelations';
import { SearchParams } from './types';
import { StoryResultMetadataLog } from '../types';

interface LogDialogContentProps {
  log: any;
  handleClose: () => void;
  storyResultMetadatas: any[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  onSearch: (searchParams?: SearchParams, setState?: boolean) => Promise<StoryResultMetadataLog[]>;
}

function getTimeSpanAroundDate(isoDateString: string, spanHours: number): [string, string] {
  let date = new Date(isoDateString);

  let beforeDate = new Date(date.getTime());
  beforeDate.setHours(date.getHours() - spanHours);
  let beforeIso = beforeDate.toISOString();

  let afterDate = new Date(date.getTime());
  afterDate.setHours(date.getHours() + spanHours);
  let afterIso = afterDate.toISOString();

  return [beforeIso, afterIso];
}

function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // The URL.revokeObjectURL() method releases an existing object URL
  URL.revokeObjectURL(url);
}

export const LogDialogContent = ({
  log,
  handleClose,
  storyResultMetadatas,
  setSelectedLogCorrelation,
  onSearch,
}: LogDialogContentProps) => {
  const [storyResultMetadatasOverride, setStoryResultMetadatasOverride] = useState<
    StoryResultMetadataLog[] | null
  >(null);

  const handleExecute = async () => {
    if (log) {
      await apiRequestPost('/admin/service/log/execute', log);
    }
  };

  const newOnSearch = async () => {
    const [startIsoDateTime, endIsoDateTime] = getTimeSpanAroundDate(log.startedAt, 2);

    await onSearch(
      {
        runtimeType: 'ALL',
        errorFilter: '',
        startIsoDateTime,
        endIsoDateTime,
      },
      true,
    ).then((data) => {
      setStoryResultMetadatasOverride(data);
    });
  };

  return (
    <>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        <LogCorrelations
          logCorrelation={log.correlation}
          storyResultMetadatas={storyResultMetadatas}
          setSelectedLogCorrelation={setSelectedLogCorrelation}
          onSearch={newOnSearch}
        />
        <LogDetails
          log={log}
          storyResultMetadatas={storyResultMetadatas}
          setSelectedLogCorrelation={setSelectedLogCorrelation}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(event) => {
            downloadJson(JSON.stringify(log, null, 2), `${log.correlation}.json`);
            event.stopPropagation();
          }}
        >
          Download
        </Button>
        {log && log.runtimeType === 'EXECUTE_STORY' && (
          <Button onClick={handleExecute}>Execute</Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </>
  );
};
