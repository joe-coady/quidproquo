import React from 'react';

// Updated styles according to the new color scheme
export const genericFunctionRendererStyles = {
  pre: {
    backgroundColor: '#1F1F1F',
    color: '#68CDFE', // Normal text (like object props) color
    padding: '10px', // Adding some padding for visual spacing
    borderRadius: '5px', // Optional: adds rounded corners to the <pre> tag
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  functionName: { color: '#D0DC8B' }, // Function color
  stringValue: { color: '#CE834A' }, // String value color
  numberValue: { color: '#B5C078' }, // Number value color
};

// Helper function to style values based on their type
const styleValueByType = (value: any, expanded: boolean) => {
  if (typeof value === 'number') {
    return <span style={genericFunctionRendererStyles.numberValue}>{value}</span>;
  } else if (typeof value === 'object') {
    // Object values are displayed using normal text color, already set in <pre>
    return JSON.stringify(value, null, 2);
  } else if (typeof value === 'string') {
    const trimmedValue = value.length > 25 && !expanded ? `${value.slice(0, 25)}...` : value;
    return <span style={genericFunctionRendererStyles.stringValue}>"{trimmedValue}"</span>;
  }
  // Fallback for other types, using normal text color
  return <span>{value}</span>;
};

// Props type definition for clarity
interface GenericFunctionRendererProps {
  functionName: string;
  args: { [key: string]: any }; // Object containing argument names and their values
  tooltipMap?: string[]; // Optional tooltips corresponding to args
  argRenderer?: (arg: string, value: any) => JSX.Element;
  expanded: boolean;
}

const renderBasicArg = (
  arg: string,
  value: any,
  index: number,
  expanded: boolean,
  tooltip?: string,
): JSX.Element => (
  <React.Fragment key={arg}>
    <span title={tooltip || arg}>{styleValueByType(value, expanded)}</span>
  </React.Fragment>
);

const GenericFunctionRenderer: React.FC<GenericFunctionRendererProps> = ({
  functionName,
  args,
  expanded,
  tooltipMap = [],
  argRenderer = renderBasicArg,
}) => {
  // Convert args object to an array of key-value pairs and map each to a span element with dynamic styling and optional tooltip
  const argEntries = Object.entries(args);
  const argsWithTooltips = argEntries.map(([arg, value], index) => (
    <>
      {argRenderer(arg, value, index, expanded, tooltipMap[index])}
      {index < argEntries.length ? ', ' : ''}
      <br />
    </>
  ));

  return (
    <>
      <span style={genericFunctionRendererStyles.functionName}>{functionName}</span>
      <>
        (<div style={{ paddingLeft: 15 }}>{argsWithTooltips}</div>)
      </>
    </>
  );
};

export default GenericFunctionRenderer;
