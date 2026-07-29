import { Nullable } from 'quidproquo-core';

import { EventDocDocument } from '../../models';
import { EventDocEventValidator } from '../types/EventDocEventValidator';

// Run rules in order and return the FIRST rejection, so a caller reads the most
// fundamental reason rather than the last one checked.
export const allOf =
  <S extends EventDocDocument = EventDocDocument>(...validators: EventDocEventValidator<S>[]): EventDocEventValidator<S> =>
  (event, state): Nullable<string> => {
    for (const validate of validators) {
      const reason = validate(event, state);
      if (reason) {
        return reason;
      }
    }

    return null;
  };
