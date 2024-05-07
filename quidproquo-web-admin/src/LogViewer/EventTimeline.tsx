import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { StoryResultMetadataWithChildren, getTimeBounds } from 'quidproquo';

import { useLogTreeData } from './hooks';

interface EventTimelineProps {
  logCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  isVisible: boolean;
}

const EVENT_HEIGHT = 30;
const EVENT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8c00', '#ff0080'];

type TimelineEventProps = {
  event: StoryResultMetadataWithChildren;
  level: number;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  scale: number;
  parrentTimeOffsetMs: number;
  totalParrentTimeOffsetMs: number;
};

const TimelineEvent = ({
  event,
  level,
  setSelectedLogCorrelation,
  scale,
  parrentTimeOffsetMs,
  totalParrentTimeOffsetMs,
}: TimelineEventProps) => {
  const eventWidth = event.executionTimeMs * scale;
  const eventOffset = totalParrentTimeOffsetMs * scale;
  const totalTimeOffset = (event.executionTimeMs + totalParrentTimeOffsetMs) * scale;

  return (
    <div style={{ width: totalTimeOffset + 100 }}>
      <div
        style={{
          width: `${eventOffset}px`,
          height: EVENT_HEIGHT,

          textAlign: 'right',
          display: totalTimeOffset ? 'inline-block' : 'none',
        }}
      ></div>
      <div
        style={{
          whiteSpace: 'nowrap',
          width: `${eventWidth}px`,
          height: EVENT_HEIGHT,
          backgroundColor: EVENT_COLORS[level % EVENT_COLORS.length],
          cursor: 'pointer',
          padding: 3,
          borderRadius: 4,
          display: 'inline-block',
        }}
        onClick={() => setSelectedLogCorrelation(event.correlation)}
      >
        {event.moduleName}::{event.generic.split('::').pop()} - @{parrentTimeOffsetMs}ms -{' '}
        {event.executionTimeMs}ms
      </div>
      {event.children.map((child: StoryResultMetadataWithChildren) => {
        const childDate = new Date(child.startedAt);
        const eventDate = new Date(event.startedAt);
        const offsetMs = childDate.getTime() - eventDate.getTime();
        const totalOffset = totalParrentTimeOffsetMs + offsetMs;

        return (
          <TimelineEvent
            key={child.correlation}
            event={child}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            level={level + 1}
            scale={scale}
            parrentTimeOffsetMs={offsetMs}
            totalParrentTimeOffsetMs={totalOffset}
          />
        );
      })}
    </div>
  );
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  logCorrelation,
  setSelectedLogCorrelation,
  isVisible,
}) => {
  const timelineData = useLogTreeData(logCorrelation, true);
  const [scaleOffset, setScaleOffset] = useState(0.0);
  const [handleOnWheel, setHandleWheel] = useState<any>(() => () => {});

  const [timelineRef, setTimelineRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleWheel = (event: any) => {
      if (event.altKey) {
        event.preventDefault(); // Prevent default scrolling behavior
        const delta = event.deltaY > 0 ? -0.01 : 0.01;
        setScaleOffset((prevScale) => Math.max(0.0, prevScale + delta));
      }
    };

    if (timelineRef) {
      timelineRef.addEventListener('wheel', handleWheel);
      setHandleWheel(handleWheel);
    }

    return () => {
      if (timelineRef) {
        timelineRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, [timelineRef]);

  if (!timelineData) {
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

  const { earliestStartedAt, latestFinishedAt } = getTimeBounds(timelineData);

  const startDate = new Date(earliestStartedAt);
  const endDate = new Date(latestFinishedAt);
  const offsetMs = endDate.getTime() - startDate.getTime();

  const scale = 1100 / offsetMs + scaleOffset;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ padding: '10px', fontSize: '18px', fontWeight: 'bold' }}>
        Total Runtime: {offsetMs}ms
      </div>
      <div
        ref={setTimelineRef}
        onWheel={handleOnWheel}
        style={{ width: '100%', height: 'calc(100% - 40px)', overflow: 'auto' }}
      >
        {timelineData[0] && (
          <TimelineEvent
            event={timelineData[0]}
            level={0}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            scale={scale}
            parrentTimeOffsetMs={0}
            totalParrentTimeOffsetMs={0}
          />
        )}
      </div>
    </div>
  );
};
