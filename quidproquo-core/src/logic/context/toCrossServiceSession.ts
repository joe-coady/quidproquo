import { StorySession } from '../../types';

// Strip service-local context before a session crosses a service boundary.
// Local context (created via createLocalContextIdentifier) must never be
// serialized onto the wire to another service - it stays within the service
// that provided it. Cross-service send processors run the outgoing session
// through this before serializing it.
export const toCrossServiceSession = (session: StorySession): StorySession => {
  if (!session.localContext) {
    return session;
  }

  const { localContext, ...crossServiceSession } = session;
  return crossServiceSession;
};
