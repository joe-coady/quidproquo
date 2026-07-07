import { VolatileChatMessageAppendedEffect } from './VolatileChatMessageAppendedEffect';
import { VolatileChatMessagesLoadedEffect } from './VolatileChatMessagesLoadedEffect';
import { VolatileChatPendingReplyChangedEffect } from './VolatileChatPendingReplyChangedEffect';
import { VolatileLogLogSearchCompletedEffect } from './VolatileLogLogSearchCompletedEffect';
import { VolatileLogLogSearchPartLoadedEffect } from './VolatileLogLogSearchPartLoadedEffect';
import { VolatileLogLogSearchStartedEffect } from './VolatileLogLogSearchStartedEffect';
import { VolatileLogSearchCompletedEffect } from './VolatileLogSearchCompletedEffect';
import { VolatileLogSearchPartLoadedEffect } from './VolatileLogSearchPartLoadedEffect';
import { VolatileLogSearchStartedEffect } from './VolatileLogSearchStartedEffect';
import { VolatileRealtimeErrorLogReceivedEffect } from './VolatileRealtimeErrorLogReceivedEffect';
import { VolatileServiceNamesLoadedEffect } from './VolatileServiceNamesLoadedEffect';

export type VolatileEffects =
  | VolatileLogSearchStartedEffect
  | VolatileLogSearchPartLoadedEffect
  | VolatileLogSearchCompletedEffect
  | VolatileLogLogSearchStartedEffect
  | VolatileLogLogSearchPartLoadedEffect
  | VolatileLogLogSearchCompletedEffect
  | VolatileChatMessagesLoadedEffect
  | VolatileChatMessageAppendedEffect
  | VolatileChatPendingReplyChangedEffect
  | VolatileServiceNamesLoadedEffect
  | VolatileRealtimeErrorLogReceivedEffect;
