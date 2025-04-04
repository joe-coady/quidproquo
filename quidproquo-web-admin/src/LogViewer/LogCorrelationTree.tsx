import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Tree, TreeNodeDatum } from 'react-d3-tree';
import { Box, CircularProgress } from '@mui/material';

import { TreeApi } from './hooks';

const BACKGROUND_COLOR = '#c1c1c1';

interface LogCorrelationTreeProps {
  correlationId: string;
  highlightCorrelationId: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  isVisible: boolean;
  treeApi: TreeApi;
}

// Here we're using `renderCustomNodeElement` to represent each node
// as an SVG `rect` instead of the default `circle`.
const renderRectSvgNode =
  (setSelectedLogCorrelation: (logCorrelation: string) => void, highlightCorrelationId: string) =>
  ({ nodeDatum }: { nodeDatum: any }) => {
    // TODO: Workout the nodeDateum type
    const color =
      nodeDatum.correlation === highlightCorrelationId
        ? nodeDatum.error
          ? '#8B0000'
          : '#00008B' // Very dark red for selected errors, dark blue for selected non-errors
        : nodeDatum.error
          ? 'red'
          : 'white'; // Bright red for non-selected errors, white for non-selected non-errors

    return (
      <g>
        <circle r={10} fill={color} x="10" y="10" onClick={() => setSelectedLogCorrelation(nodeDatum.correlation)} />
        {[nodeDatum.moduleName, nodeDatum.runtimeType, (nodeDatum.generic || '').split('::').pop(), nodeDatum.error || '']
          .filter((t) => !!t)
          .map((text, i) => {
            const x = 0;
            const y = i === 0 ? -20 : 10 + i * 20;
            const fontSize = i === 0 ? 30 : 15;
            return (
              <Fragment key={`${i}`}>
                <rect x={x - 50} y={y - fontSize / 2 - 8} width="100" height={fontSize} fill={BACKGROUND_COLOR} strokeWidth="0" />
                <text textAnchor="middle" fontSize={fontSize} fill={nodeDatum.error ? 'red' : 'black'} strokeWidth={0} y={y}>
                  {text}
                </text>
              </Fragment>
            );
          })}
      </g>
    );
  };

const LogCorrelationTreeComponent = ({
  correlationId,
  highlightCorrelationId,
  setSelectedLogCorrelation,
  isVisible,
  treeApi,
}: LogCorrelationTreeProps) => {
  const treeContainer = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (treeContainer.current && isVisible) {
      const { clientWidth } = treeContainer.current;
      setTranslate({ x: clientWidth / 2, y: 40 });
    }
  }, [treeApi.treeData, isVisible]);

  if (treeApi.isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  if (!treeApi.treeData) {
    return <div>Error</div>;
  }

  return (
    <div ref={treeContainer} style={{ width: '100%', height: '100%', background: BACKGROUND_COLOR }}>
      <Tree
        // TODO: Pass the correct type here
        data={treeApi.treeData as unknown as TreeNodeDatum[]}
        orientation="vertical"
        renderCustomNodeElement={renderRectSvgNode(setSelectedLogCorrelation, highlightCorrelationId)}
        translate={translate}
      />
    </div>
  );
};

export const LogCorrelationTree = memo(LogCorrelationTreeComponent);
