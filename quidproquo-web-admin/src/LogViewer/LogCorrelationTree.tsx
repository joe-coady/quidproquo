import { useState, useEffect, useRef, memo, Fragment } from 'react';
import { Tree } from 'react-d3-tree';
import { StoryResultMetadataLog } from '../types';
import { findLogDirectChildren } from './logic';

const BACKGROUND_COLOR = '#c1c1c1';

interface LogCorrelationTreeProps {
  rootStoryResultMetadata: StoryResultMetadataLog;
  allStoryResultMetadatas: StoryResultMetadataLog[];
  highlightCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

const createHierarchy = (
  rootStoryResultMetadata: StoryResultMetadataLog,
  allStoryResultMetadatas: StoryResultMetadataLog[],
): any => {
  const childrenLogs: StoryResultMetadataLog[] = findLogDirectChildren(
    rootStoryResultMetadata,
    allStoryResultMetadatas,
  );

  const children = childrenLogs
    .sort((a, b) => {
      return a.startedAt < b.startedAt ? -1 : 1;
    })
    .map((child) => createHierarchy(child, allStoryResultMetadatas));

  return {
    ...rootStoryResultMetadata,
    children,
  };
};

// Here we're using `renderCustomNodeElement` to represent each node
// as an SVG `rect` instead of the default `circle`.
const renderRectSvgNode =
  (setSelectedLogCorrelation: (logCorrelation: string) => void, highlightCorrelation: string) =>
  ({ nodeDatum }) => {
    const color =
      nodeDatum.correlation === highlightCorrelation
        ? !!nodeDatum.error
          ? '#8B0000'
          : '#00008B' // Very dark red for selected errors, dark blue for selected non-errors
        : !!nodeDatum.error
        ? 'red'
        : 'white'; // Bright red for non-selected errors, white for non-selected non-errors

    return (
      <g>
        <circle
          r={10}
          fill={color}
          x="10"
          y="10"
          onClick={() => setSelectedLogCorrelation(nodeDatum.correlation)}
        />
        {[
          nodeDatum.moduleName,
          nodeDatum.runtimeType,
          nodeDatum.generic.split('::').pop(),
          nodeDatum.error || '',
        ]
          .filter((t) => !!t)
          .map((text, i) => {
            const x = 0;
            const y = i === 0 ? -20 : 10 + i * 20;
            const fontSize = i === 0 ? 30 : 15;
            return (
              <Fragment key={`${i}`}>
                <rect
                  x={x - 50}
                  y={y - fontSize / 2 - 8}
                  width="100"
                  height={fontSize}
                  fill={BACKGROUND_COLOR}
                  strokeWidth="0"
                />
                <text
                  textAnchor="middle"
                  fontSize={fontSize}
                  fill={!!nodeDatum.error ? 'red' : 'black'}
                  strokeWidth={0}
                  y={y}
                >
                  {text}
                </text>
              </Fragment>
            );
          })}
      </g>
    );
  };

const LogCorrelationTreeComponent = ({
  rootStoryResultMetadata,
  allStoryResultMetadatas,
  highlightCorrelation,
  setSelectedLogCorrelation,
}: LogCorrelationTreeProps) => {
  const treeContainer = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeData = createHierarchy(rootStoryResultMetadata, allStoryResultMetadatas);

  useEffect(() => {
    if (treeContainer.current) {
      const { clientWidth } = treeContainer.current;
      setTranslate({ x: clientWidth / 2, y: 40 });
    }
  }, []);

  return (
    <div
      ref={treeContainer}
      style={{ width: '100%', height: '100%', background: BACKGROUND_COLOR }}
    >
      <Tree
        data={treeData}
        orientation="vertical"
        renderCustomNodeElement={renderRectSvgNode(setSelectedLogCorrelation, highlightCorrelation)}
        translate={translate}
      />
    </div>
  );
};

export const LogCorrelationTree = memo(LogCorrelationTreeComponent);
