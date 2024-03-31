import ClaudeAiActionProcessor from './claudeAi/ClaudeAiActionProcessor';
import DateActionProcessor from './date/DateActionProcessor';
import ErrorActionProcessor from './error/ErrorActionProcessor';
import EventActionProcessor from './event/EventActionProcessor';
import GuidActionProcessor from './guid/GuidActionProcessor';
import LogActionProcessor from './log/LogActionProcessor';
import MathActionProcessor from './math/MathActionProcessor';
import NetworkActionProcessor from './network/NetworkActionProcessor';
import PlatformActionProcessor from './platform/PlatformActionProcessor';
import SystemActionProcessor from './system/SystemActionProcessor';

export default {
  ...ClaudeAiActionProcessor,
  ...DateActionProcessor,
  ...ErrorActionProcessor,
  ...EventActionProcessor,
  ...GuidActionProcessor,
  ...LogActionProcessor,
  ...MathActionProcessor,
  ...NetworkActionProcessor,
  ...PlatformActionProcessor,
  ...SystemActionProcessor,
};
