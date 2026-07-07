import { ContextListActionPayload } from 'quidproquo-core';

import { Box } from '@mui/material';

import { AnyVariableView, genericFunctionRendererStyles } from '../genericActionRenderer';
import { ActionComponent, ActionComponentProps } from '../types';

export const CoreContextListCustomAction: ActionComponent<ContextListActionPayload> = ({
  result,
  expanded,
}: ActionComponentProps<ContextListActionPayload>) => {
  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <pre style={genericFunctionRendererStyles.pre}>
        <AnyVariableView expanded={expanded} value={result} />
      </pre>
    </Box>
  );
};
