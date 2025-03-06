import { NetworkRequestActionPayload } from 'quidproquo-core';

import { GenericFunctionRenderer, genericFunctionRendererStyles } from '../genericActionRenderer';
import ActionResultDisplay from '../genericActionRenderer/ActionResultDisplay';
import { ActionComponent } from '../types';

export const CoreNetworkRequestCustomAction: ActionComponent<NetworkRequestActionPayload<any>> = ({ action, result, expanded }) => {
  if (!action.payload) {
    return null;
  }

  return (
    <>
      <pre style={genericFunctionRendererStyles.pre}>
        <GenericFunctionRenderer
          functionName={'askNetworkRequest'}
          args={[
            action.payload.method,
            action.payload.url,
            {
              body: action.payload.body,
              headers: action.payload.headers,
              basePath: action.payload.basePath,
              params: action.payload.params,
              responseType: action.payload.responseType,
            },
          ]}
          tooltipMap={['method', 'url', 'httpRequestOptions']}
          expanded={expanded}
        />
      </pre>
      <ActionResultDisplay action={action} result={result} expanded={expanded} />
    </>
  );
};
