import React from 'react';

import { ActionComponent } from '../types';
import ActionResultDisplay from './ActionResultDisplay';
import { GenericFunctionRenderer, genericFunctionRendererStyles } from './AnyVariableView'; // Assuming this is the correct path

export const getGenericActionRenderer =
  (functionName: string, argMap: string[], tooltipMap: string[] = argMap): ActionComponent =>
  ({ action, expanded, result }) => {
    const anyPayload = action.payload as any;
    const args = argMap.reduce((acc, arg) => ({ ...acc, [arg]: anyPayload[arg] }), {});

    return (
      <>
        <pre style={genericFunctionRendererStyles.pre}>
          <GenericFunctionRenderer functionName={functionName} args={args} tooltipMap={tooltipMap} expanded={expanded} />
        </pre>
        <ActionResultDisplay action={action} result={result} expanded={expanded} />
      </>
    );
  };
