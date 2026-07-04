import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';

// What an app implements once and shares both sides: given the incoming event and the
// prior log, fold the document with the app's reducer and run the validator registry,
// returning the rejection reason or null. The frontend editor receives it via config; the
// backend `eventValidator` inline function wraps it.
export type EventDocEditorValidator = (event: EventDocEvent, events: EventDocEvent[]) => Nullable<string>;
