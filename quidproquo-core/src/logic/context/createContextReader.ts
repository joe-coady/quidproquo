import { AskResponse, QpqContextIdentifier } from '../../types';
import { askContextRead } from '../../actions';

export function createContextReader<R>(contextIdentifier: QpqContextIdentifier<R>) {
  return function* askContextReadWrapper(): AskResponse<R> {
    return yield* askContextRead(contextIdentifier);
  };
}
