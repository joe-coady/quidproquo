import DateActionProcessor from './date/DateActionProcessor';
import ErrorActionProcessor from './error/ErrorActionProcessor';
import EventActionProcessor from './event/EventActionProcessor';
import GuidActionProcessor from './guid/GuidActionProcessor';
import LogActionProcessor from './log/LogActionProcessor';
import MathActionProcessor from './math/MathActionProcessor';
import PlatformActionProcessor from './platform/PlatformActionProcessor';
import SystemActionProcessor from './system/SystemActionProcessor';

export default {
  ...DateActionProcessor,
  ...ErrorActionProcessor,
  ...EventActionProcessor,
  ...GuidActionProcessor,
  ...LogActionProcessor,
  ...MathActionProcessor,
  ...PlatformActionProcessor,
  ...SystemActionProcessor,
};
