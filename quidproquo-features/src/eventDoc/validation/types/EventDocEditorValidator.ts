import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';

// What an app implements once and shares both sides: given the incoming event and the
// prior log, fold the document with the app's reducer and run the validator registry,
// returning the rejection reason or null. The frontend editor receives it via config; the
// backend enforces the same rules through the definition's fold gate.
export type EventDocEditorValidator = (event: EventDocEvent, events: EventDocEvent[]) => Nullable<string>;
