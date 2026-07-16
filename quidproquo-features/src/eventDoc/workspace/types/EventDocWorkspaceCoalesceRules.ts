import { CoalesceEventType } from './CoalesceEventType';

// 'all' = last-write-wins for EVERY event type (the local-slot default, so session
// streams like chrome hold one event per field instead of growing per toggle). An
// explicit list applies only those rules; unlisted types append.
export type EventDocWorkspaceCoalesceRules = CoalesceEventType[] | 'all';
