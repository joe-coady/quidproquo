import { QpqExecutionTrace } from 'quidproquo-core';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Chip, FormControl, IconButton, MenuItem, Select, Slider, Tooltip, Typography } from '@mui/material';

import { LocalValueTree } from './LocalValueTree';
import { buildLineAnnotations, formatLineAnnotation, getDefaultSourceIndex, getDisplaySourceNames } from './traceViewerLogic';

interface TraceViewerProps {
  trace: QpqExecutionTrace;
}

// Layout notes (deliberate, don't regress):
// - the slider row contains ONLY the prev/slider/next controls — any text that changes
//   width as you scrub (step counter, function names) lives in the header row instead,
//   so the slider never jumps under the pointer
// - source paths are enormous (federated chunk files) — everything that shows one is
//   width-bounded with tail-ellipsis (rtl trick keeps the distinguishing END visible)
//   and carries the full path in a tooltip

const monoFont = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Ellipsis that keeps the END of the text visible — for paths the tail is the part
// that differs. (rtl only changes which side collapses; the string itself is ltr.)
const tailEllipsisStyle: React.CSSProperties = {
  direction: 'rtl',
  overflow: 'hidden',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const codeAreaStyle: React.CSSProperties = {
  fontFamily: monoFont,
  fontSize: '12px',
  lineHeight: '20px',
  overflow: 'auto',
  whiteSpace: 'pre',
  height: '100%',
  border: '1px solid rgba(128, 128, 128, 0.3)',
  borderRadius: 4,
};

export const TraceViewer: React.FC<TraceViewerProps> = ({ trace }) => {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(() => getDefaultSourceIndex(trace));
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const highlightedLineRef = useRef<HTMLDivElement | null>(null);

  const annotations = useMemo(() => buildLineAnnotations(trace, selectedSourceIndex), [trace, selectedSourceIndex]);
  const displaySourceNames = useMemo(() => getDisplaySourceNames(trace.sources.map((traceSource) => traceSource.path)), [trace.sources]);

  const selectedStep = trace.steps[selectedStepIndex];
  const source = trace.sources[selectedSourceIndex];
  const sourceLines = useMemo(() => (source?.content ? source.content.split('\n') : null), [source]);

  // Scrubbing into a step from another source file follows the execution there — keyed
  // on the step index only, so manual source selection isn't fought by the effect.
  useEffect(() => {
    if (selectedStep && selectedStep.sourceIndex !== selectedSourceIndex) {
      setSelectedSourceIndex(selectedStep.sourceIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStepIndex]);

  useEffect(() => {
    highlightedLineRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedStepIndex, selectedSourceIndex]);

  const highlightedLine = selectedStep && selectedStep.sourceIndex === selectedSourceIndex ? selectedStep.line : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      {/* header row — source picker, stats, and the step indicator's stable home */}
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, minWidth: 0 }}>
        {trace.sources.length > 1 ? (
          <FormControl size="small" sx={{ flexShrink: 0, width: 280 }}>
            <Select
              MenuProps={{ PaperProps: { sx: { maxWidth: 680 } } }}
              onChange={(event) => setSelectedSourceIndex(Number(event.target.value))}
              renderValue={(sourceIndex) => <span style={tailEllipsisStyle}>{displaySourceNames[sourceIndex as number]}</span>}
              value={selectedSourceIndex}
            >
              {trace.sources.map((traceSource, sourceIndex) => (
                <MenuItem
                  key={traceSource.path}
                  sx={{ direction: 'rtl', display: 'block', overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={traceSource.path}
                  value={sourceIndex}
                >
                  {displaySourceNames[sourceIndex]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Tooltip title={source?.path || ''}>
            <Typography sx={{ ...tailEllipsisStyle, flexShrink: 0, width: 280 }} variant="caption">
              {displaySourceNames[selectedSourceIndex]}
            </Typography>
          </Tooltip>
        )}

        <Chip label={`${trace.steps.length} steps`} size="small" sx={{ flexShrink: 0 }} />
        <Chip label={`${trace.stats.replayMs}ms replay`} size="small" sx={{ flexShrink: 0 }} />
        {trace.stats.instrumentMs !== undefined && <Chip label={`${trace.stats.instrumentMs}ms setup`} size="small" sx={{ flexShrink: 0 }} />}
        {trace.truncated && <Chip color="warning" label="truncated - step budget hit" size="small" sx={{ flexShrink: 0 }} />}

        <Box sx={{ flex: 1 }} />

        <Chip label={`step ${selectedStepIndex + 1} / ${trace.steps.length}`} size="small" sx={{ flexShrink: 0 }} variant="outlined" />
      </Box>

      {/* slider row — controls only, fixed geometry while scrubbing */}
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, px: 1 }}>
        <IconButton disabled={selectedStepIndex <= 0} onClick={() => setSelectedStepIndex(selectedStepIndex - 1)} size="small">
          ◀
        </IconButton>
        <Slider
          max={Math.max(trace.steps.length - 1, 0)}
          min={0}
          onChange={(event, value) => setSelectedStepIndex(value as number)}
          size="small"
          value={selectedStepIndex}
          valueLabelDisplay="auto"
          valueLabelFormat={(stepIndex) => `step ${stepIndex + 1}`}
        />
        <IconButton disabled={selectedStepIndex >= trace.steps.length - 1} onClick={() => setSelectedStepIndex(selectedStepIndex + 1)} size="small">
          ▶
        </IconButton>
      </Box>

      {/* main area — code on the left, Watch panel on the right */}
      <Box sx={{ display: 'flex', flex: 1, gap: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {!sourceLines && (
            <Alert severity="info">
              No source content available for this file (no source map in the code store) — steps reference {source?.path} by line only.
            </Alert>
          )}

          {sourceLines && (
            <div style={codeAreaStyle}>
              {sourceLines.map((lineText, lineIndex) => {
                const lineNumber = lineIndex + 1;
                const annotation = annotations.get(lineNumber);
                const isHighlighted = lineNumber === highlightedLine;

                return (
                  <div
                    key={lineNumber}
                    ref={isHighlighted ? highlightedLineRef : undefined}
                    onClick={() => {
                      // Jump the scrubber to this line's first visit
                      const stepIndex = trace.steps.findIndex((step) => step.sourceIndex === selectedSourceIndex && step.line === lineNumber);
                      if (stepIndex >= 0) {
                        setSelectedStepIndex(stepIndex);
                      }
                    }}
                    style={{
                      backgroundColor: isHighlighted ? 'rgba(255, 200, 0, 0.25)' : annotation ? 'rgba(0, 160, 255, 0.06)' : undefined,
                      cursor: annotation ? 'pointer' : undefined,
                      display: 'flex',
                    }}
                  >
                    <span
                      style={{
                        color: 'rgba(128, 128, 128, 0.8)',
                        flexShrink: 0,
                        padding: '0 8px',
                        textAlign: 'right',
                        userSelect: 'none',
                        width: 48,
                      }}
                    >
                      {lineNumber}
                    </span>
                    <span style={{ flexShrink: 0 }}>{lineText}</span>
                    {annotation && (
                      <span style={{ color: 'rgba(128, 160, 128, 0.9)', fontStyle: 'italic', paddingLeft: 24 }}>
                        {`// ${formatLineAnnotation(annotation)}`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Box>

        {/* Watch — the selected step's locals, expandable */}
        <Box
          sx={{
            border: '1px solid rgba(128, 128, 128, 0.3)',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            minWidth: 240,
            overflow: 'hidden',
            width: '33%',
          }}
        >
          <Box sx={{ borderBottom: '1px solid rgba(128, 128, 128, 0.3)', px: 1, py: 0.5 }}>
            <Typography sx={{ fontWeight: 600 }} variant="caption">
              Watch
            </Typography>
            {selectedStep && (
              <Typography color="text.secondary" noWrap sx={{ display: 'block' }} variant="caption">
                {selectedStep.functionName || '(anonymous)'} : line {selectedStep.line}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, fontFamily: monoFont, fontSize: '12px', lineHeight: '18px', overflow: 'auto', p: 1 }}>
            {selectedStep?.returnValue && (
              <div style={{ borderBottom: '1px solid rgba(128, 128, 128, 0.3)', marginBottom: 4, paddingBottom: 4 }}>
                <LocalValueTree name="→ returns" value={selectedStep.returnValue} />
              </div>
            )}
            {selectedStep ? (
              Object.entries(selectedStep.locals).map(([name, value]) => <LocalValueTree key={name} name={name} value={value} />)
            ) : (
              <Typography color="text.secondary" variant="caption">
                No step selected
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
