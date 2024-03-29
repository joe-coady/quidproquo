import { ActionComponent } from '../types';
import TruncatedText from '../../TruncatedText';
import { genericFunctionRendererStyles, styleValueByType } from './GenericFunctionRenderer';

const ActionResultDisplay: ActionComponent = ({ historyItem, expanded }) => {
  const result = historyItem.res || [];
  const successResult = result[0];
  const errorResult = result[1];

  return (
    <>
      {successResult !== undefined && !errorResult && (
        <pre style={genericFunctionRendererStyles.pre}>
          <span>Result: </span>
          {styleValueByType(successResult, expanded)}
        </pre>
      )}
      {errorResult !== undefined && (
        <pre style={genericFunctionRendererStyles.pre}>
          <TruncatedText
            title="Error"
            text={JSON.stringify(errorResult, null, 2)}
            expanded={expanded}
          />
        </pre>
      )}
    </>
  );
};

// Make sure to export ActionResultDisplay if it's defined in a separate file
export default ActionResultDisplay;
