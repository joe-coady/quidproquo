import { useState } from 'react';
import { Typography, IconButton } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const TruncatedText = ({
  title,
  subText,
  maxLength = 50,
}: {
  title: string;
  subText: string;
  maxLength: number;
}) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const canTruncate = subText.length > maxLength;

  const truncatedText = subText.slice(0, maxLength) + '...';

  const handleToggle = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <div>
      <div>
        <Typography variant="h6" component="span">
          {title}
        </Typography>
        {canTruncate && (
          <IconButton onClick={handleToggle} style={{ marginRight: '8px' }}>
            {isTruncated ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        )}
      </div>
      <pre
        style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline' }}
      >
        {isTruncated && canTruncate ? truncatedText : subText}
      </pre>
    </div>
  );
};

export default TruncatedText;
