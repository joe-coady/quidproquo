import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceApiAppendEvent } from './askEventDocWorkspaceApiAppendEvent';
import { askEventDocWorkspaceApiFetchBootstrap } from './askEventDocWorkspaceApiFetchBootstrap';
import { askEventDocWorkspaceApiFetchEvents } from './askEventDocWorkspaceApiFetchEvents';
import { askEventDocWorkspaceApiFetchEventsPage } from './askEventDocWorkspaceApiFetchEventsPage';

// The standard transport: speaks the feature's own event routes over
// askApiRequest, so any runtime with an ApiActionType.Request processor (the web
// runtime, the dev server) can drive a workspace with zero wiring. Other hosts (tests,
// backend stories) inject their own EventDocWorkspaceTransport instead.
export const eventDocWorkspaceApiTransport: EventDocWorkspaceTransport = {
  askFetchBootstrap: askEventDocWorkspaceApiFetchBootstrap,
  askFetchEvents: askEventDocWorkspaceApiFetchEvents,
  askFetchEventsPage: askEventDocWorkspaceApiFetchEventsPage,
  askAppendEvent: askEventDocWorkspaceApiAppendEvent,
};
