import { EventDocEffect } from '../../models';
import { CoalesceEventType } from '../types';

// Reserved field-setters coalesce like domain field edits, so a burst of details-pane
// keystrokes collapses to one pending event. Lifecycle events (CREATE_DRAFT/PUBLISH)
// deliberately do NOT coalesce: each is a distinct step.
export const reservedEventDocWorkspaceCoalesceEventTypes: CoalesceEventType[] = [EventDocEffect.SetCode, EventDocEffect.SetName];
