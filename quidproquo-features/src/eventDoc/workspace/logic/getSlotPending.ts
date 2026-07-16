import { EventDocEvent } from '../../models';
import { noEvents } from '../constants/noEvents';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

export const getSlotPending = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => state.pending[slotKey] ?? noEvents;
