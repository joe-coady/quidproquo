// Who produced an event — a point-in-time snapshot captured server-side at
// append time (from the access token). Denormalised so history renders without a
// user lookup; `userId` stays the stable, authoritative key, `userDisplayName`
// is purely for display and reflects the name as it was when the event happened.
export type EventDocEventActor = {
  userId: string;
  userDisplayName: string;
};
