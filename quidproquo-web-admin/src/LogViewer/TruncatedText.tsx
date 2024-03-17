import { useState } from 'react';
import { Typography, IconButton } from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TruncatedText = ({
  title,
  text,
  expanded,
}: {
  title: string;
  text: string;
  expanded: boolean;
}) => {
  const canTruncate = text.split('\n').length > 3;
  const truncatedText = text.split('\n').slice(0, 3).join('\n') + '...';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          left: '-45px',
          top: '-10px',
        }}
      >
        <IconButton onClick={handleCopy} style={{ marginLeft: '8px' }}>
          <ContentCopyIcon />
        </IconButton>
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: 'inline',
        }}
      >
        {title}: {!expanded && canTruncate ? truncatedText : text}
      </pre>
    </div>
  );
};

export default TruncatedText;
