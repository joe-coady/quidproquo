import TruncatedText from '../../TruncatedText';
import { ActionComponent } from '../types';
import { genericFunctionRendererStyles } from './AnyVariableView';
import { AnyVariableView } from './AnyVariableView';

const ActionResultDisplay: ActionComponent = ({ historyItem, expanded }) => {
  const result = historyItem.res || [];
  const successResult = result[0];
  const errorResult = result[1];

  return (
    <>
      {successResult !== undefined && !errorResult && (
        <pre style={genericFunctionRendererStyles.pre}>
          <span>Result: </span>
          <AnyVariableView value={successResult} expanded={expanded} />
        </pre>
      )}
      {errorResult !== undefined && (
        <pre style={genericFunctionRendererStyles.pre}>
          <AnyVariableView value={errorResult} expanded={expanded} />
        </pre>
      )}
    </>
  );
};

// Make sure to export ActionResultDisplay if it's defined in a separate file
export default ActionResultDisplay;
