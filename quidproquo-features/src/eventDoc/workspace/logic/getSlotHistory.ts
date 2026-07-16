import { EventDocEvent } from '../../models';
import { noEvents } from '../constants/noEvents';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

export const getSlotHistory = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => state.history[slotKey] ?? noEvents;
