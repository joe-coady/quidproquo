import DateActionProcessor from "./date/DateActionProcessor";
import EventActionProcessor from "./event/EventActionProcessor";
import GuidActionProcessor from "./guid/GuidActionProcessor";
import MathActionProcessor from "./math/MathActionProcessor";
import PlatformActionProcessor from "./platform/PlatformActionProcessor";
import SystemActionProcessor from "./system/SystemActionProcessor";

export default {
  ...DateActionProcessor,
  ...EventActionProcessor,
  ...GuidActionProcessor,
  ...MathActionProcessor,
  ...PlatformActionProcessor,
  ...SystemActionProcessor,
};
