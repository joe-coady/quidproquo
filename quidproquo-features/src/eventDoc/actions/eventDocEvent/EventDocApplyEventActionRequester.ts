import { EventDocActionType } from './EventDocActionType';
import { EventDocApplyEventActionRequester } from './EventDocApplyEventActionRequesterTypes';

// Pure: only yields the declarative ApplyEvent action — a registered processor decides
// HOW (and stamps the editor's schema version + provenance). No side effects, so the
// verbs that yield* it run anywhere (backend, tests, transforms).
export function* askApplyEventDocEvent(eventType: string, data: unknown): EventDocApplyEventActionRequester {
  return yield {
    type: EventDocActionType.ApplyEvent,
    payload: { eventType, data },
  };
}
