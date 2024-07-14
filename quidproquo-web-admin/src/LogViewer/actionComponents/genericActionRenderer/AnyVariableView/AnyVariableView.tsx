import React from 'react';

// Updated styles according to the new color scheme
export const genericFunctionRendererStyles = {
  pre: {
    backgroundColor: '#1F1F1F',
    color: '#68CDFE', // Normal text (like object props) color
    padding: '10px', // Adding some padding for visual spacing
    borderRadius: '5px', // Optional: adds rounded corners to the <pre> tag
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word' as 'break-word',
  },
  functionName: { color: '#D0DC8B' }, // Function color
  stringValue: { color: '#CE834A' }, // String value color
  numberValue: { color: '#B5C078' }, // Number value color
  undefinedValue: { color: '#4A9CB3' }, // Number value color
  booleanValue: { color: '#4A9CB3' }, // Number value color
  emptyObject: { color: 'grey' }, // Number value color
  arrayItems: { color: 'white' }, // Number value color
  commentBlock: { color: '#5E993E', paddingBottom: 10 }, // Number value color
  highlightComment: { color: 'white' }, // Number value color
  jsonComment: { color: '#5E993E' }, // Number value color
};

type VariableViewProps = {
  value: any;
  expanded: boolean;
};

export const StringVariableView = ({ value, expanded }: VariableViewProps) => {
  try {
    const jsonValue = JSON.parse(value);
    if (typeof jsonValue === 'number') {
      throw new Error('Not a JSON string');
    }

    return (
      <>
        <span style={genericFunctionRendererStyles.jsonComment}>
          {'<'}json{'>'}
        </span>
        <AnyVariableView value={jsonValue} expanded={expanded} />
      </>
    );
  } catch {
    const trimmedValue = value.length > 25 && !expanded ? `${value.slice(0, 25)}...` : value;
    return <span style={genericFunctionRendererStyles.stringValue}>"{trimmedValue}"</span>;
  }
};

export const ArrayVariableView = ({ value, expanded }: VariableViewProps) => {
  if (value.length == 0) {
    return !expanded ? (
      <>
        <span>[</span>
        <span style={genericFunctionRendererStyles.emptyObject}>Empty Array</span>
        <span>]</span>
      </>
    ) : (
      <>[]</>
    );
  }

  if (expanded) {
    return (
      <>
        <span>[</span>
        <div style={{ paddingLeft: 10 }}>
          {value.map((item: any, index: number) => (
            <div key={index}>
              <AnyVariableView value={item} expanded={expanded} />,
            </div>
          ))}
        </div>
        <span>]</span>
      </>
    );
  }

  return (
    <>
      <span>[ </span>
      <span style={genericFunctionRendererStyles.arrayItems}>{value.length} items</span>
      <span> ]</span>
    </>
  );
};

export const KvsQueryConditionVariableView = ({ value, expanded }: VariableViewProps) => {
  return <GenericFunctionRenderer functionName={`kvs${value.operation}`} args={[value.key, value.valueA]} expanded={expanded} />;
};

export const KvsLogicalOperatorVariableView = ({ value, expanded }: VariableViewProps) => {
  return <GenericFunctionRenderer functionName={`kvs${value.operation}`} args={[value.conditions]} expanded={expanded} />;
};

export const EmptyObjectVariableView = ({ value, expanded }: VariableViewProps) => {
  return !expanded ? (
    <>
      <span>{'{ '}</span>
      <span style={genericFunctionRendererStyles.emptyObject}>Empty Object</span>
      <span>{' }'}</span>
    </>
  ) : (
    <>{`{ }`}</>
  );
};

export const QpqBinaryDataVariableView = ({ value, expanded }: VariableViewProps) => {
  return (
    <img src={`data:${value.mimeType || 'image/jpeg'};base64,${value.base64Data}`} alt="Binary Data" style={{ width: '100px', height: 'auto' }} />
  );
};

export const ObjectVariableView = ({ value, expanded }: VariableViewProps) => {
  if (Array.isArray(value)) {
    return <ArrayVariableView value={value} expanded={expanded} />;
  }

  const objectKeys = Object.keys(value);

  if (value.operation && value.key && objectKeys.length <= 4) {
    return <KvsQueryConditionVariableView value={value} expanded={expanded} />;
  } else if (value.operation && value.conditions && objectKeys.length == 2) {
    return <KvsLogicalOperatorVariableView value={value} expanded={expanded} />;
  } else if (objectKeys.length == 0) {
    return <EmptyObjectVariableView value={value} expanded={expanded} />;
  } else if (value.base64Data && value.filename) {
    return <QpqBinaryDataVariableView value={value} expanded={expanded} />;
  }

  const cleanObject = JSON.parse(JSON.stringify(value));
  const cleanObjectKeys = Object.keys(cleanObject);

  return !expanded ? (
    <>
      <span>{'{ '}</span>
      {cleanObjectKeys.join(', ')}
      <span>{' }'}</span>
    </>
  ) : (
    <>
      <span>{'{ '}</span>
      <div style={{ paddingLeft: 10 }}>
        {cleanObjectKeys.map((key, index) => (
          <div key={key}>
            {key}: <AnyVariableView value={cleanObject[key]} expanded={expanded} />,
          </div>
        ))}
      </div>
      <span>{'}'}</span>
    </>
  );
};

// Helper function to style values based on their type
export const AnyVariableView = ({ value, expanded }: VariableViewProps) => {
  if (value === undefined) {
    return <span style={genericFunctionRendererStyles.undefinedValue}>undefined</span>;
  } else if (value === null) {
    return <span style={genericFunctionRendererStyles.undefinedValue}>null</span>;
  } else if (typeof value === 'boolean') {
    return <span style={genericFunctionRendererStyles.booleanValue}>{value.toString()}</span>;
  } else if (typeof value === 'number') {
    return <span style={genericFunctionRendererStyles.numberValue}>{value}</span>;
  } else if (typeof value === 'string') {
    return <StringVariableView value={value} expanded={expanded} />;
  } else if (typeof value === 'object') {
    return <ObjectVariableView value={value} expanded={expanded} />;
  }

  // Fallback for other types, using normal text color
  return <span>{value.toString()}</span>;
};

interface GenericFunctionRendererProps {
  functionName: string;
  args: { [key: string]: any }; // Object containing argument names and their values
  tooltipMap?: string[]; // Optional tooltips corresponding to args
  argRenderer?: (arg: string, value: any) => JSX.Element;
  expanded: boolean;
}

const renderBasicArg = (arg: string, value: any, index: number, expanded: boolean, tooltip?: string): JSX.Element => {
  const tooltipText = `${tooltip || arg}\n\nvalue: ${JSON.stringify(value, null, 2)}`;

  return (
    <React.Fragment key={arg}>
      <span title={tooltipText}>
        <AnyVariableView value={value} expanded={expanded} />
      </span>
    </React.Fragment>
  );
};

export const GenericFunctionRenderer: React.FC<GenericFunctionRendererProps> = ({
  functionName,
  args,
  expanded,
  tooltipMap = [],
  argRenderer = renderBasicArg,
}) => {
  // Convert args object to an array of key-value pairs and map each to a span element with dynamic styling and optional tooltip
  const argEntries = Object.entries(args);
  const argsWithTooltips = argEntries.map(([arg, value], index) => (
    <React.Fragment key={index}>
      {argRenderer(arg, value, index, expanded, tooltipMap[index])}
      {index < argEntries.length ? ', ' : ''}
      <br />
    </React.Fragment>
  ));

  return (
    <>
      <span style={genericFunctionRendererStyles.functionName}>{functionName}</span>
      {argEntries.length > 0 && (
        <>
          (<div style={{ paddingLeft: 15 }}>{argsWithTooltips}</div>)
        </>
      )}
      {argEntries.length == 0 && <>()</>}
    </>
  );
};
