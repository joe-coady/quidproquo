import { ActionHistory } from 'quidproquo';
import TruncatedText from './TruncatedText';

interface ActionHistoryItemProps {
  historyItem: ActionHistory;
  expanded: boolean;
}

export const ActionHistoryItem = ({ historyItem, expanded }: ActionHistoryItemProps) => {
  const inputText = JSON.stringify(historyItem.act.payload, null, 2);
  const outputText = JSON.stringify(historyItem.res, null, 2);

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
