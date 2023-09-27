import { askDateNow } from "../../actions";
import { AskResponse } from "../../types";

export function* askGetCurrentEpoch(): AskResponse<number> {
    const currentDateTime = yield* askDateNow();

    // Convert the ISO datetime string to a Date object.
    const dateObj = new Date(currentDateTime);

    // Convert the Date object to an epoch timestamp.
    const epochTime = Math.floor(dateObj.getTime() / 1000);

    return epochTime;
}