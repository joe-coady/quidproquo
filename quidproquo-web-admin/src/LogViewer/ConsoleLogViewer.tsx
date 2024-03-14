import { ObjectInspector } from 'react-inspector';

import { memo } from 'react';
import { StoryResult } from 'quidproquo-core';

interface ConsoleLogViewerProps {
  logs: StoryResult<any>['logs'];
}

export const ConsoleLogViewer = ({ logs }: ConsoleLogViewerProps) => {
  if (!logs) {
    return null;
  }

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {logs.map((log, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '5px' }}>
          <span style={{ marginRight: '5px' }}>
            {new Date(log.t).toLocaleTimeString('en-AU', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}{' '}
            -
          </span>
          {log.a.map((arg: any, argIndex: number) => (
            <span key={argIndex} style={{ marginRight: '5px', paddingTop: '3px' }}>
              <ObjectInspector data={arg} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default memo(ConsoleLogViewer);
