import React from 'react';

// Updated styles according to the new color scheme
export const genericFunctionRendererStyles = {
  pre: {
    backgroundColor: '#1F1F1F',
    color: '#68CDFE', // Normal text (like object props) color
    padding: '10px', // Adding some padding for visual spacing
    borderRadius: '5px', // Optional: adds rounded corners to the <pre> tag
  },
  functionName: { color: '#D0DC8B' }, // Function color
  stringValue: { color: '#CE834A' }, // String value color
  numberValue: { color: '#B5C078' }, // Number value color
};

// Helper function to style values based on their type
const styleValueByType = (value: any) => {
  if (typeof value === 'number') {
    return <span style={genericFunctionRendererStyles.numberValue}>{value}</span>;
  } else if (typeof value === 'object') {
    // Object values are displayed using normal text color, already set in <pre>
    return JSON.stringify(value, null, 2);
  } else if (typeof value === 'string') {
    return <span style={genericFunctionRendererStyles.stringValue}>"{value}"</span>;
  }
  // Fallback for other types, using normal text color
  return <span>{value}</span>;
};

// Props type definition for clarity
interface GenericFunctionRendererProps {
  functionName: string;
  args: { [key: string]: any }; // Object containing argument names and their values
  tooltipMap?: string[]; // Optional tooltips corresponding to args
}

const GenericFunctionRenderer: React.FC<GenericFunctionRendererProps> = ({
  functionName,
  args,
  tooltipMap = [],
}) => {
  // Convert args object to an array of key-value pairs and map each to a span element with dynamic styling and optional tooltip
  const argsWithTooltips = Object.entries(args).map(([arg, value], index) => (
    <React.Fragment key={arg}>
      {index > 0 ? ', ' : ''} {/* Add comma before args except the first one */}
      <span title={tooltipMap[index] || arg}>{styleValueByType(value)}</span>
    </React.Fragment>
  ));

  return (
    <>
      <span style={genericFunctionRendererStyles.functionName}>{functionName}</span>
      {argsWithTooltips}
    </>
  );
};

export default GenericFunctionRenderer;
