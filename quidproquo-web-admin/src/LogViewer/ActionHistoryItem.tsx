import { Action } from 'quidproquo-core';

import TruncatedText from './TruncatedText';

interface ActionHistoryItemProps {
  action: Action<any>;
  result: any;
  expanded: boolean;
}

export const ActionHistoryItem = ({ action, result, expanded }: ActionHistoryItemProps) => {
  const inputText = JSON.stringify(action.payload, null, 2);
  const outputText = JSON.stringify(result, null, 2);

  return (
    <>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <TruncatedText title="Input" text={inputText} expanded={expanded} />
      </pre>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <TruncatedText title="Output" text={outputText} expanded={expanded} />
      </pre>
    </>
  );
};
