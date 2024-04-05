import { GenericFunctionRenderer, genericFunctionRendererStyles } from '../genericActionRenderer';
import ActionResultDisplay from '../genericActionRenderer/ActionResultDisplay';
import { ActionComponent } from '../types';

export const CoreNetworkRequestCustomAction: ActionComponent = ({ historyItem, expanded }) => {
  return (
    <>
      <pre style={genericFunctionRendererStyles.pre}>
        <GenericFunctionRenderer
          functionName={'askNetworkRequest'}
          args={[
            historyItem.act.payload.method,
            historyItem.act.payload.url,
            {
              body: historyItem.act.payload.body,
              headers: historyItem.act.payload.headers,
              basePath: historyItem.act.payload.basePath,
              params: historyItem.act.payload.params,
              responseType: historyItem.act.payload.responseType,
            },
          ]}
          tooltipMap={['method', 'url', 'httpRequestOptions']}
          expanded={expanded}
        />
      </pre>
      <ActionResultDisplay historyItem={historyItem} expanded={expanded} />
    </>
  );
};
