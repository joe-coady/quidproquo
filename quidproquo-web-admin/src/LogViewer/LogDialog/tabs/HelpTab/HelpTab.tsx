import React from 'react';

import { HelpChat } from '../../../HelpChat';
import { AsyncStoryState } from '../../hooks';

interface HelpTabProps {
  log: AsyncStoryState;
}

export const HelpTab: React.FC<HelpTabProps> = ({ log }) => {
  return <HelpChat logCorrelation={log.logCorrelation} />;
};
