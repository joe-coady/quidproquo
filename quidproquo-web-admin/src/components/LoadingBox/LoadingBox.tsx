import React from 'react';

import { useDataFromPath } from './hooks';
import { useIsLoading } from '../../view';
import { LoadingProvider } from '../../view';

import { Box, CircularProgress } from '@mui/material';

interface LoadingBoxProps {
  path: string;
  renderItem: (item: any) => React.ReactNode;
}

const LoadingBoxInternal: React.FC<LoadingBoxProps> = ({ path, renderItem }) => {
  const isLoading = useIsLoading();
  const data = useDataFromPath(path);

  var reactNode: JSX.Element = <div>Error: Data could not be loaded</div>;

  if (isLoading) {
    reactNode = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          width: '100%',
          p: 2,
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  } else if (data) {
    reactNode = <>{renderItem(data)}</>;
  }

  return <LoadingProvider>{reactNode}</LoadingProvider>;
};

export const LoadingBox: React.FC<LoadingBoxProps> = ({ path, renderItem }) => {
  return (
    <LoadingProvider>
      <LoadingBoxInternal path={path} renderItem={renderItem} />
    </LoadingProvider>
  );
};
