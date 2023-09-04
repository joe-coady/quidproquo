import { ContextActionType, ContextReadActionPayload } from "../../actions/context";
import { 
    Action,
    AskResponse, 
    AskResponseReturnType, 
    EitherActionResult, 
    QpqContextIdentifier
  } from "../../types";


export function* askContextProvideValue<T extends AskResponse<any>>(
    contextIdentifier: QpqContextIdentifier<any>,
    value: any,
    storyIterator: T
  ): AskResponse<EitherActionResult<AskResponseReturnType<T>>> {
    let nextResult = storyIterator.next();

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
            // Grab the parent context values
            const parentContextValues = yield nextResult.value;

            // overide / attach our context value
            const allContextValues = {
                ...parentContextValues,
                [contextIdentifier.uniqueName]: value
            }
            
            // return it to our children
            nextResult = storyIterator.next(allContextValues);

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
