import { ContextActionType, ContextReadActionPayload } from "../../actions/context";
import { 
    Action,
    AskResponse, 
    AskResponseReturnType, 
    EitherActionResult, 
    QpqContext, 
    QpqContextIdentifier
  } from "../../types";


export function* askContextProvideValue<R, T extends AskResponse<any>>(
    contextIdentifier: QpqContextIdentifier<R>,
    value: R,
    storyIterator: T
  ): AskResponse<EitherActionResult<AskResponseReturnType<T>>> {
    let nextResult = storyIterator.next();

    // We cache the context values because the parent can't change, unilateral dataflow
    // and we don't want to recompute the context values every time we are asked for them.
    // we dont want to hit the hit the owner of the context as it shows in the logs for no reason
    let cache: QpqContext<any> | null = null;

    while (!nextResult.done) {
        // If this action is a read context
        if (nextResult.value.type === ContextActionType.Read) {
            // and its trying to read from this context
            const contextActionItterator = nextResult as IteratorYieldResult<Action<ContextReadActionPayload<any>>>;
            if (contextActionItterator.value.payload!.contextIdentifier.uniqueName === contextIdentifier.uniqueName) {
                // then we feed it our value
                nextResult = storyIterator.next(value);

                // And keep processing
                continue;
            }
        }

        // If we are trying to list all context values
        else if (nextResult.value.type === ContextActionType.List) {
            // Update the cache
            if (cache === null) {
                // Grab the parent context values
                const parentContextValues = yield nextResult.value;

                // overide / attach our context value
                const allContextValues = {
                    ...parentContextValues,
                    [contextIdentifier.uniqueName]: value
                }

                // Update the cache
                cache = allContextValues;
            }
            
            // pass in our chached context values
            nextResult = storyIterator.next(cache);

            // And keep processing
            continue;
        }

        // Otherwise this is not a context action
        // use the parent processor to process it.
        const actionValue = yield nextResult.value;
        
        // and pass that value down to our children.
        nextResult = storyIterator.next(actionValue);
    }

    // Return the successful final result of the generator
    return nextResult.value;
}
